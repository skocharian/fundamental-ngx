import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import { DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, TAB, UP_ARROW } from '@angular/cdk/keycodes';
import { CdkDrag } from '@angular/cdk/drag-drop';

import { forkJoin, fromEvent, Subscription } from 'rxjs';
import { debounceTime, take } from 'rxjs/operators';
import { DialogService, KeyUtil, MessageToastService, RtlService } from '@fundamental-ngx/core';

import { ApprovalFlowApproverDetailsComponent } from './approval-flow-approver-details/approval-flow-approver-details.component';
import { ApprovalFlowNodeComponent } from './approval-flow-node/approval-flow-node.component';
import { ApprovalFlowAddNodeComponent } from './approval-flow-add-node/approval-flow-add-node.component';
import { displayUserFn, isNodeApproved, trackByFn } from './helpers';
import { ApprovalDataSource, ApprovalNode, ApprovalProcess, ApprovalTeam, ApprovalUser } from './interfaces';

export type ApprovalGraphNode = ApprovalNode & { blank?: boolean; meta?: any };

export interface ApprovalGraphNodeMetadata {
    parent: ApprovalGraphNode;
    isRoot: boolean;
    isLast: boolean;
    parallelStart: boolean;
    parallelEnd: boolean;
    isParallel: boolean;
    isLastInParallel?: boolean;
    columnIndex?: number;
    nodeIndex?: number;
    prevVNode?: ApprovalGraphNode;
    nextVNode?: ApprovalGraphNode;
    prevHNode?: ApprovalGraphNode;
    nextHNode?: ApprovalGraphNode;
    canAddNodeBefore?: boolean;
    canAddNodeAfter?: boolean;
    canAddParallel?: boolean;
}

interface ApprovalGraphColumn {
    nodes: ApprovalGraphNode[];
    index?: number;
    isPartial?: boolean;
    allNodesApproved?: boolean;
}

type ApprovalFlowGraph = ApprovalGraphColumn[];

type ApprovalFlowMessageType =
    'watchersChangeSuccess' |
    'approverAddSuccess' |
    'teamAddSuccess' |
    'nodeEdit' |
    'nodeRemove' |
    'nodesRemove' |
    'teamRemove' |
    'error';

@Component({
    selector: 'fdp-approval-flow',
    templateUrl: './approval-flow.component.html',
    styleUrls: ['./approval-flow.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ApprovalFlowComponent implements OnInit, OnDestroy {
    /** Title which is displayed in the header of the Approval Flow component. */
    @Input() title = 'Approval  process';

    /** Data source for the Approval Flow component. */
    @Input() dataSource: ApprovalDataSource;

    /** A reference to the user details template */
    @Input() userDetailsTemplate: TemplateRef<any>;

    /** Number of days before due date when status changes to `warning` with text 'Due in X days' */
    @Input() dueDateThreshold = 7;

    /** A list of approval statuses that allow sending reminders to their approvers */
    @Input() allowSendRemindersForStatuses: string[] = ['in progress', 'not started'];

    /** Whether the approval flow is editable */
    @Input() isEditAvailable = false;

    /** Event emitted on approval flow node click. */
    @Output() nodeClick = new EventEmitter<ApprovalNode>();

    /** @hidden */
    @ViewChild('graphContainerEl') _graphContainerEl: ElementRef;

    /** @hidden */
    @ViewChild('graphEl') _graphEl: ElementRef;

    /** @hidden */
    @ViewChild('reminderTemplate') _reminderTemplate: TemplateRef<any>;

    /** @hidden */
    @ViewChildren(ApprovalFlowNodeComponent) _nodeComponents: QueryList<ApprovalFlowNodeComponent>;

    /** @hidden */
    _approvalProcess: ApprovalProcess;

    /** @hidden */
    _initialApprovalProcess: ApprovalProcess;

    /** @hidden */
    _previousApprovalProcess: ApprovalProcess;

    /** @hidden */
    _graph: ApprovalFlowGraph;

    /** @hidden */
    _isCarousel = false;

    /** @hidden */
    _carouselScrollX = 0;

    /** @hidden */
    _carouselStep = 0;

    /** @hidden */
    _maxCarouselStep = 0;

    /** @hidden */
    _nodeParentsMap: { [key: string]: ApprovalGraphNode } = {};

    /** @hidden */
    _metaMap: { [key: string]: ApprovalGraphNodeMetadata } = {};

    /**  @hidden */
    _dir: string;

    /**  @hidden */
    _isEditMode = false;

    /**  @hidden */
    _canAddBefore = false;

    /**  @hidden */
    _canAddAfter = false;

    /**  @hidden */
    _canAddParallel = false;

    /**  @hidden */
    _isRemoveButtonVisible = false;

    /**  @hidden */
    _teams: ApprovalTeam[] = [];

    /**  @hidden */
    _usersForWatchersList: ApprovalUser[] = [];

    /**  @hidden */
    _selectedWatchers: ApprovalUser[] = [];

    /**  @hidden */
    _messages: { type: ApprovalFlowMessageType }[] = [];

    /**  @hidden */
    _displayUserFn = displayUserFn;

    /** @hidden */
    _trackByFn = trackByFn;

    private subscriptions = new Subscription();

    /** @hidden */
    constructor(
        private _dialogService: DialogService,
        private _messageToastService: MessageToastService,
        private _cdr: ChangeDetectorRef,
        @Optional() private _rtlService: RtlService
    ) {
    }

    /** @hidden */
    get _isRTL(): boolean {
        return this._dir === 'rtl';
    }

    /** @hidden */
    ngOnInit(): void {
        if (!this.dataSource) {
            return;
        }

        this.subscriptions.add(this.dataSource.fetch().subscribe(approvalProcess => {
            console.log('Got approval process data from DataSource, nodes count', approvalProcess.nodes.length);
            this._initialApprovalProcess = JSON.parse(JSON.stringify(approvalProcess));
            this._buildView(approvalProcess);
        }));
        this.subscriptions.add(this._rtlService.rtl.subscribe(isRtl => {
            this._dir = isRtl ? 'rtl' : 'ltr';
            this._cdr.detectChanges();
        }));

        this._listenOnResize();
    }

    onNodeClick(node: ApprovalNode): void {
        const dialog = this._dialogService.open(ApprovalFlowApproverDetailsComponent, {
            data: {
                node: node,
                allowSendReminder: this.allowSendRemindersForStatuses.includes(node.status),
                ...this._defaultDialogOptions
            }
        });
        dialog.afterClosed.subscribe((reminderTargets) => {
            if (Array.isArray(reminderTargets)) {
                this.sendReminders(reminderTargets, node);
            }
        });
        this.nodeClick.emit(node);
    }

    /** @hidden */
    _onNodeCheck(node: ApprovalNode): void {
        const checked = this._nodeComponents.filter(n => n._isSelected);
        const checkedNodesCount = checked.length;
        this._isRemoveButtonVisible = checkedNodesCount > 0;
        const canAdd = checkedNodesCount === 1 && !isNodeApproved(checked[0].node);
        this._canAddBefore = canAdd && this._metaMap[node.id].canAddNodeBefore;
        this._canAddAfter = canAdd && this._metaMap[node.id].canAddNodeAfter;
        this._canAddParallel = canAdd && this._metaMap[node.id].canAddParallel;
    }

    onWatcherClick(watcher: ApprovalUser): void {
        this._dialogService.open(ApprovalFlowApproverDetailsComponent, {
            data: {
                watcher: watcher,
                ...this._defaultDialogOptions
            }
        });


    }

    sendReminders(targets: ApprovalUser[], node: ApprovalNode): void {
        this.dataSource.sendReminders(targets, node).pipe(take(1)).subscribe(() => {
            this._messageToastService.open(this._reminderTemplate, {
                data: {
                    targets: targets,
                    node: node
                },
                duration: 5000
            });
        });
    }

    nextSlide(stepSize = 1): void {
        this._checkCarouselStatus();
        if (Math.abs(this._carouselScrollX) === this._scrollDiff) {
            return;
        }

        const newOffset = this._carouselScrollX - this._carouselStepSize * stepSize;
        const newCarouselStep = this._carouselStep + stepSize;
        this._carouselScrollX = (Math.abs(newOffset) > this._scrollDiff) ? -this._scrollDiff : newOffset;
        this._carouselStep = newCarouselStep <= this._maxCarouselStep ? newCarouselStep : this._maxCarouselStep;
        this._cdr.detectChanges();
    }

    previousSlide(stepSize = 1): void {
        this._checkCarouselStatus();
        if (this._carouselStep === 0) {
            return;
        }
        if (this._carouselStep === 1) {
            this._carouselScrollX = 0;
        } else {
            this._carouselScrollX += this._carouselStepSize * stepSize;
            this._carouselScrollX = this._carouselScrollX <= 0 ? this._carouselScrollX : 0;
        }
        const newCarouselStep = this._carouselStep - stepSize;
        this._carouselStep = newCarouselStep > 0 ? newCarouselStep : 0;
        this._cdr.detectChanges();
    }

    onNodeKeyDown(
        event: KeyboardEvent,
        node: ApprovalGraphNode,
        nodeIndex: number,
        columnIndex: number,
        firstColumn: boolean,
        firstNode: boolean,
        lastColumn: boolean,
        lastNode: boolean
    ): void {
        if (!KeyUtil.isKeyCode(event, [TAB, UP_ARROW, DOWN_ARROW, RIGHT_ARROW, LEFT_ARROW])) {
            return;
        }

        const isTab = KeyUtil.isKeyCode(event, TAB);
        const isShift = event.shiftKey;

        if (
            isTab &&
            ((isShift && firstNode && firstColumn) ||
                (!isShift && lastColumn && lastNode))
        ) {
            return;
        }

        if (isTab) {
            const nodesSequence = this._graph.reduce((result: ApprovalGraphNode[], col: ApprovalGraphColumn) => {
                return result.concat(col.nodes);
            }, []).filter(n => !n.blank);
            const currentNodeIndex = nodesSequence.findIndex(n => n === node);
            const diff = isShift ? -1 : 1;
            const nextNode = nodesSequence[currentNodeIndex + diff];
            if (currentNodeIndex > -1 && nextNode) {
                event.preventDefault();
                this._focusNode(nextNode, 1);
                return;
            }
        }

        event.preventDefault();
        let nextFocusTarget;

        if (KeyUtil.isKeyCode(event, UP_ARROW) && nodeIndex > 0) {
            nextFocusTarget = this._getNextVerticalNode(nodeIndex, columnIndex, 'up');
        }

        if (KeyUtil.isKeyCode(event, DOWN_ARROW)) {
            nextFocusTarget = this._getNextVerticalNode(nodeIndex, columnIndex, 'down');
        }

        if (KeyUtil.isKeyCode(event, LEFT_ARROW)) {
            nextFocusTarget = this._getNextHorizontalNode(nodeIndex, columnIndex, this._isRTL ? 'right' : 'left');
        }

        if (KeyUtil.isKeyCode(event, RIGHT_ARROW)) {
            nextFocusTarget = this._getNextHorizontalNode(nodeIndex, columnIndex, this._isRTL ? 'left' : 'right');
        }

        if (nextFocusTarget?.nextNode) {
            this._focusNode(nextFocusTarget.nextNode, nextFocusTarget.stepSize);
        }
    }

    /** @hidden */
    _enterEditMode(): void {
        forkJoin([this.dataSource.fetchWatchers(), this.dataSource.fetchTeams()])
            .subscribe(([users, teams]) => {
                this._usersForWatchersList = users;
                this._teams = teams;
                this._selectedWatchers = [...this._approvalProcess.watchers];
                this._isEditMode = true;
                this._initialApprovalProcess = JSON.parse(JSON.stringify(this._approvalProcess));
            });
    }

    /** @hidden */
    _saveEditModeChanges(): void {
        this._initialApprovalProcess = null;
        this._isEditMode = false;
        this._messages = [];
        this.dataSource.updateApprovals(this._approvalProcess.nodes);
        if (this._isWatchersListChanged) {
            this.dataSource.updateWatchers(this._selectedWatchers);
        }
    }

    /** @hidden */
    _exitEditMode(): void {
        this._approvalProcess = JSON.parse(JSON.stringify(this._initialApprovalProcess));
        this._initialApprovalProcess = null;
        this._isEditMode = false;
        this._messages = [];
        this._buildView(this._approvalProcess);
    }

    /** @hidden */
    _showMessage(type: ApprovalFlowMessageType): void {
        this._messages = [{ type: type }];
    }

    /** @hidden */
    _dismissMessage(index: number): void {
        this._messages.splice(index, 1);
    }

    /** @hidden */
    _undoLastAction(): void {
        console.log('undo');
        this._approvalProcess = JSON.parse(JSON.stringify(this._previousApprovalProcess));
        this._buildView(this._approvalProcess);
    }

    addNode(source: ApprovalGraphNode, type: 'before' | 'after' | 'parallel' | 'blank'): void {
        const _source = source.blank ? this._metaMap[source.id].prevHNode : source;
        console.log(`add ${type}`);
        if (type.indexOf(':d') > -1) {
            // TODO Ilya: dev only
            const _qnType = type.replace(':d', '');
            console.log('add quick node', _qnType);
            const _qNode = getBlankNode();
            _qNode.id = `qNodeId${(Math.random() * 1000).toFixed()}`;
            _qNode.blank = false;
            _qNode.approvers = [{
                id: 'uid99655',
                name: 'Fred Gibson',
                description: 'Marketing team',
                imgUrl: 'https://randomuser.me/api/portraits/men/45.jpg'
            }];
            _qNode.targets = _source.targets;
            if (_qnType === 'after') {
                _source.targets = [_qNode.id];
                this._updateNode(_source);
            }
            if (_qnType === 'parallel') {
                const parent = this._metaMap[_source.id].parent;
                parent.targets.push(_qNode.id);
                this._updateNode(parent);
            }
            this._approvalProcess.nodes.push(_qNode);
            this._buildView(this._approvalProcess);
            return;
        }
        const dialog = this._dialogService.open(ApprovalFlowAddNodeComponent, {
            data: {
                nodeTarget: type,
                showNodeTypeSelect: true,
                teams: this._teams,
                node: Object.assign({}, getBlankNode(), { blank: false }),
                ...this._defaultDialogOptions
            }
        });
        dialog.afterClosed.subscribe((data: { node: ApprovalNode, nodeType }) => {
            if (!data) {
                return;
            }
            const { node, nodeType } = data;
            if (!node) {
                return;
            }
            this._cacheCurrentApprovalProcess();
            console.log(`dialog closed, adding node, button target ${type}, dialog type ${nodeType}`);
            if (node.approvalTeamId) {
                const team = this._teams.find(t => t.id === node.approvalTeamId);
                console.log('add approvers from team', team, node);
                node.description = team.name;
                // return;
            }
            node.id = `tempId${(Math.random() * 1000).toFixed()}`;
            node.description = node.description || node.approvers[0].description;
            node.targets = _source.targets;
            if (nodeType === 'Serial') {
                if (type === 'after' || type === 'blank') {
                    _source.targets = [node.id];
                    this._updateNode(_source);
                }

                if (type === 'before') {
                    node.targets = [_source.id];
                    const parent = this._metaMap[_source.id].parent;
                    parent.targets = [node.id];
                    this._replaceTargetsInSourceNodes(_source.id, [node.id]);
                    this._updateNode(parent);
                }
            }
            if (nodeType === 'Parallel') {
                const parent = this._metaMap[_source.id].parent;
                parent.targets.push(node.id);
                this._updateNode(parent);
            }
            this._showMessage(node.approvalTeamId ? 'teamAddSuccess' : 'approverAddSuccess');
            this._approvalProcess.nodes.push(node);
            this._buildView(this._approvalProcess);
        });
    }

    addNodeFromToolbar(type: 'before' | 'after' | 'parallel'): void {
        const node = this._nodeComponents.filter(n => n._isSelected)[0].node;
        this.addNode(node, type);
    }

    editNode(node: ApprovalNode): void {
        const dialog = this._dialogService.open(ApprovalFlowAddNodeComponent, {
            data: {
                isEdit: true,
                node: Object.assign({}, node),
                ...this._defaultDialogOptions
            }
        });
        dialog.afterClosed.subscribe((data: { node }) => {
            const updatedNode = data?.node;
            if (!updatedNode) {
                return;
            }
            this._cacheCurrentApprovalProcess();
            this._updateNode(updatedNode);
            this._showMessage('nodeEdit');
            this._buildView(this._approvalProcess);
        });
    }

    /** @hidden */
    _onNodeDelete(nodeToDelete: ApprovalNode): void {
        this._cacheCurrentApprovalProcess();
        this._deleteNode(nodeToDelete);
        this._showMessage(nodeToDelete.approvalTeamId ? 'teamRemove' : 'nodeRemove');
        this._buildView(this._approvalProcess);
    }

    /** @hidden */
    _deleteCheckedNodes(): void {
        this._cacheCurrentApprovalProcess();
        this._nodeComponents.filter(n => n._isSelected).forEach(n => this._deleteNode(n.node));
        this._showMessage('nodesRemove');
        this._buildView(this._approvalProcess);
    }

    /** @hidden */
    _onNodeDrag(node: ApprovalGraphNode): void {
        const draggedNodeDimensions = this._nodeComponents
            .find(comp => comp.node === node)._nativeElement.getBoundingClientRect();
        this._nodeComponents
            .filter(n => n.node !== node && Boolean(n.dropZones.length))
            .forEach(n => {
                n._checkIfNodeDraggedInDropZone(draggedNodeDimensions);
            });
    }

    /** @hidden */
    _onNodeDrop(nodeToDrop: ApprovalGraphNode, drag: CdkDrag): void {
        drag.reset();
        const dropTarget = this._nodeComponents.find(n => n._isAnyDropZoneActive);
        if (!dropTarget) {
            return;
        }
        const placement = dropTarget._activeDropZones[0].placement;
        this._nodeComponents.forEach(n => n._deactivateDropZones());
        const nodeMeta = this._metaMap[nodeToDrop.id];
        const targetNode = dropTarget.node;
        const dropTargetMeta = this._metaMap[dropTarget.node.id];

        if (placement === 'after' && nodeMeta.prevHNode?.id === dropTarget.node.id) {
            return;
        }
        if (placement === 'blank' && dropTargetMeta.prevHNode.id === nodeToDrop.id) {
            return;
        }

        this._deleteNode(nodeToDrop);

        if (placement === 'blank') {
            const targetId = dropTargetMeta.nextHNode?.id || dropTargetMeta.prevHNode?.targets[0];
            nodeToDrop.targets = [targetId];
            dropTargetMeta.prevHNode.targets = [nodeToDrop.id];
        }

        if (placement === 'after') {
            nodeToDrop.targets = [...targetNode.targets];
            targetNode.targets = [nodeToDrop.id];
        }

        if (placement === 'before') {
            this._replaceTargetsInSourceNodes(targetNode.id, [nodeToDrop.id]);
            nodeToDrop.targets = [targetNode.id];
        }

        this._approvalProcess.nodes.push(nodeToDrop);
        this._buildView(this._approvalProcess);
    }

    /** @hidden */
    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    // TODO Ilya: dev only
    _highlightNodes(ids: string[]): void {
        const comps = this._nodeComponents.filter(c => ids.includes(c.node.id));
        comps.forEach(c => c._nativeElement.classList.add('highlighted'));
        setTimeout(() => comps.forEach(c => c._nativeElement.classList.remove('highlighted')), 3000);
    }

    /** @hidden */
    private _buildNodeTree(nodes: ApprovalGraphNode[]): ApprovalFlowGraph {
        const graph: ApprovalFlowGraph = [];
        const rootNode = findRootNode(nodes);
        if (!rootNode) {
            return graph;
        }

        graph[0] = { nodes: [rootNode] };
        let index = 1;
        let foundLastStep = false;
        const _metaMap: { [key: string]: ApprovalGraphNodeMetadata } = {};

        // meta 1st run
        nodes.forEach(n => {
            const parents = findParentNode(n, nodes);
            _metaMap[n.id] = {
                parent: parents[0],
                isRoot: !parents.length,
                isLast: !n.targets.length,
                parallelStart: n.targets.length > 1,
                parallelEnd: parents.length > 1,
                isParallel: nodes.filter(_n => findParentNode(_n, nodes).includes(parents[0])).length > 1
            };
        });
        Object.keys(_metaMap).forEach(id => {
            const meta = _metaMap[id];
            meta.isParallel = meta.isParallel || (_metaMap[meta.parent?.id]?.isParallel && !meta.parallelEnd);
        });
        let _nodes = [...nodes];
        do {
            const columnNodes: ApprovalGraphNode[] = [];
            const previousColumnNodes = graph[index - 1].nodes;
            previousColumnNodes.forEach(node => {
                const _columnNodes = findDependentNodes(node, _nodes);
                _nodes = _nodes.filter(n => !_columnNodes.includes(n));
                _columnNodes.forEach(columnNode => this._nodeParentsMap[columnNode.id] = node);
                columnNodes.push(..._columnNodes);
            });
            foundLastStep = columnNodes.length === 0;
            if (foundLastStep) {
                break;
            }

            const parallelNodes = columnNodes.filter(node => _metaMap[node.id].isParallel);
            // const isMixed = columnNodes.length > 1 && parallelNodes.length && parallelNodes.length !== columnNodes.length;
            // const isMixed = parallelNodes.length && previousColumnNodes.filter(_n => _n.blank).length;
            // if (isMixed && previousColumnNodes.length > 1) {
            if (previousColumnNodes.length > 1 && parallelNodes.length > 0) {
                const parallelColumn: ApprovalGraphNode[] = [...previousColumnNodes];
                parallelColumn.forEach((node, i) => {
                    if (node.blank) {
                        parallelColumn[i] = getBlankNode();
                        return;
                    }
                    const target = columnNodes.find(n => isNodeTargetsIncludeId(node, n.id));
                    if (target && !_metaMap[target.id].isParallel) {
                        if (_nodes.indexOf(target) === -1) {
                            _nodes.push(target);
                        }
                        parallelColumn[i] = getBlankNode();
                    } else {
                        parallelColumn[i] = target;
                    }
                });
                graph[index] = { nodes: parallelColumn, isPartial: true };
            } else {
                graph[index] = { nodes: columnNodes };
            }

            index++;
        } while (!foundLastStep);

        // meta 2nd run
        const blank = graph.map(c => c.nodes).reduce((a, b) => a.concat(b)).filter(n => n.blank);
        const allNodes = nodes.concat(blank);
        allNodes.forEach(n => {
            const columnIndex = graph.findIndex(c => c.nodes.includes(n));
            if (columnIndex === -1) {
                console.warn('ERROR: node not found in graph', n);
                return;
            }
            const nodeIndex = graph[columnIndex].nodes.findIndex(_n => _n === n);
            _metaMap[n.id] = {
                ..._metaMap[n.id],
                columnIndex: columnIndex,
                nodeIndex: nodeIndex,
                prevVNode: graph[columnIndex].nodes[nodeIndex - 1],
                nextVNode: graph[columnIndex].nodes[nodeIndex + 1],
                prevHNode: graph[columnIndex - 1]?.nodes[nodeIndex],
                nextHNode: graph[columnIndex + 1]?.nodes[nodeIndex]
            };
            if (n.blank) {
                _metaMap[n.id].isParallel = true;
            }
        });
        // meta 3rd run
        allNodes.forEach(n => {
            const meta = _metaMap[n.id];
            const nextHNode = meta.nextHNode;
            const parent = meta.parent;
            const isNotApproved = !isNodeApproved(n);
            meta.canAddNodeAfter = isNotApproved && !nextHNode?.blank;
            meta.canAddNodeBefore = n.status === 'not started' && Boolean(parent) && !isNodeApproved(parent) && (_metaMap[parent.id]?.parallelStart || meta.parallelEnd);
            meta.canAddParallel = isNotApproved && !meta.parallelEnd && (!meta.isLast && !meta.isRoot);
            meta.isLastInParallel = meta.isParallel && graph[meta.columnIndex + 1]?.nodes.length === 1;
        });
        this._metaMap = _metaMap;
        graph.forEach(col => col.allNodesApproved = col.nodes.every(isNodeApproved));
        console.log('nodes metadata', this._metaMap);
        console.log('graph to display', graph);

        return graph;
    }

    /** @hidden */
    private _buildView(approvalProcess: ApprovalProcess): void {
        this._approvalProcess = approvalProcess;
        this._nodeParentsMap = {};
        this._metaMap = {};
        this._graph = this._buildNodeTree(approvalProcess.nodes);
        const graphNodes = this._graph.map(a => a.nodes).reduce((a, b) => a.concat(b));
        const blankLength = graphNodes.filter(n => n.blank).length;
        console.log(
            `graph nodes length ${graphNodes.length}`,
            graphNodes.length !== approvalProcess.nodes.length && !blankLength ? 'ERROR: rendered more nodes than provided' : `${blankLength} blank nodes`
        );
        this._resetCheckedNodes();
        this._cdr.detectChanges();
        this._checkCarouselStatus();
        if (!this._isEditMode) {
            this._resetCarousel();
        }
    }

    /** @hidden Listen window resize and distribute cards on column change */
    private _listenOnResize(): void {
        this.subscriptions.add(
            fromEvent(window, 'resize')
                .pipe(debounceTime(60))
                .subscribe(() => {
                    this._resetCarousel();
                    this._checkCarouselStatus();
                })
        );
    }

    /** @hidden */
    private _focusNode(node: ApprovalGraphNode, step: number): void {
        const nodeToFocus = this._nodeComponents.find(comp => comp.node === node);
        if (!nodeToFocus) {
            return;
        }

        const nodeRect = nodeToFocus._nativeElement.getBoundingClientRect();
        const graphContainerRect = this._graphContainerEl.nativeElement.getBoundingClientRect();
        const graphVisibilityThreshold = graphContainerRect.width;
        const nodeOffsetFromContainerEdge = this._isRTL ?
            (graphContainerRect.right - nodeRect.right) :
            (nodeRect.left - graphContainerRect.left);

        nodeToFocus._focus();

        if ((nodeOffsetFromContainerEdge + nodeRect.width) > graphVisibilityThreshold) {
            this.nextSlide(step);
            return;
        }

        if (nodeOffsetFromContainerEdge < 0) {
            this.previousSlide(step);
        }
    }

    /** @hidden */
    private _updateNode(node: ApprovalNode): void {
        const nodeIndex = this._approvalProcess.nodes.findIndex(n => n.id === node.id);
        if (nodeIndex > -1) {
            this._approvalProcess.nodes[nodeIndex] = node;
        }
    }

    /** @hidden */
    private _deleteNode(nodeToDelete: ApprovalNode): void {
        const _nodes = [...this._approvalProcess.nodes];
        const meta = this._metaMap[nodeToDelete.id];
        const prevNodeInParallel = this._metaMap[meta.prevHNode?.id]?.isParallel;
        const nextNodeBlank = meta.nextHNode?.blank;
        this._replaceTargetsInSourceNodes(
            nodeToDelete.id,
            (meta.isLastInParallel && !prevNodeInParallel) || (!meta.isLastInParallel && nextNodeBlank) ? [] : nodeToDelete.targets
        );

        _nodes.splice(_nodes.findIndex(n => n.id === nodeToDelete.id), 1);
        this._approvalProcess.nodes = _nodes;
    }

    /** @hidden */
    private _replaceTargetsInSourceNodes(idToReplace: string, replaceWith: string[]): void {
        this._approvalProcess.nodes.forEach(n => {
            if (isNodeTargetsIncludeId(n, idToReplace)) {
                n.targets = n.targets.filter(_id => _id !== idToReplace);
                n.targets.push(...replaceWith);
            }
        });
    }

    /** @hidden */
    private _cacheCurrentApprovalProcess(): void {
        this._previousApprovalProcess = JSON.parse(JSON.stringify(this._approvalProcess));
    }

    /** @hidden */
    private _checkCarouselStatus(): void {
        this._isCarousel = this._graphEl.nativeElement.scrollWidth > this._graphEl.nativeElement.clientWidth;
        this._maxCarouselStep = Math.ceil(this._scrollDiff / this._carouselStepSize);
        this._cdr.detectChanges();
    }

    /** @hidden */
    private _resetCarousel(): void {
        this._carouselStep = 0;
        this._carouselScrollX = 0;
    }

    /** @hidden */
    private _resetCheckedNodes(): void {
        this._nodeComponents?.forEach(c => c._isSelected = false);
        this._canAddAfter = false;
        this._canAddBefore = false;
        this._canAddParallel = false;
        this._isRemoveButtonVisible = false;
    }

    /** @hidden */
    private _getNextHorizontalNode = (_ni: number, _ci: number, direction: 'left' | 'right', stepSize: number = 1) => {
        const indexDiff = (direction === 'right' ? 1 : -1);
        const _column = this._graph[_ci + indexDiff];
        if (!_column) {
            return { nextNode: undefined, stepSize: stepSize };
        }

        const _nextNode = _column.nodes[_ni] || _column.nodes[0];
        if (_nextNode.blank) {
            return this._getNextHorizontalNode(_ni, _ci + indexDiff, direction, stepSize + 1);
        }

        return { nextNode: _nextNode, stepSize: stepSize };
    };

    /** @hidden */
    private _getNextVerticalNode = (_ni: number, _ci: number, direction: 'up' | 'down', stepSize: number = 1) => {
        const indexDiff = (direction === 'down' ? 1 : -1);
        const _column = this._graph[_ci];
        const _nextColumn = this._graph[_ci + 1];
        const _nextNode = _column.nodes[_ni + indexDiff] || _nextColumn?.nodes[_ni + 1];
        if (_nextNode && _nextNode.blank) {
            return this._getNextVerticalNode(_ni, _ci + indexDiff, direction, stepSize + 1);
        }

        return { nextNode: _nextNode, stepSize: stepSize };
    };

    /** @hidden */
    private get _carouselStepSize(): number {
        return this._graphEl.nativeElement.scrollWidth / this._graphEl.nativeElement.children.length;
    }

    /** @hidden */
    private get _scrollDiff(): number {
        return this._graphEl.nativeElement.scrollWidth - this._graphEl.nativeElement.clientWidth;
    }

    /** @hidden */
    private get _defaultDialogOptions(): any {
        return {
            approvalFlowDataSource: this.dataSource,
            userDetailsTemplate: this.userDetailsTemplate,
            rtl: this._isRTL
        };
    }

    /** @hidden */
    private get _isWatchersListChanged(): boolean {
        return this._selectedWatchers.length !== this._approvalProcess.watchers.length ||
            this._selectedWatchers.some(watcher => !this._approvalProcess.watchers.find(_watcher => _watcher === watcher));
    }
}

function findRootNode(nodes: ApprovalNode[]): ApprovalNode {
    return nodes.find(node => nodes.every(n => !isNodeTargetsIncludeId(n, node.id)));
}

function findParentNode(node: ApprovalNode, nodes: ApprovalNode[]): ApprovalNode[] {
    return nodes.filter(_node => isNodeTargetsIncludeId(_node, node.id));
}

function findDependentNodes(root: ApprovalNode, nodes: ApprovalNode[]): ApprovalNode[] {
    return nodes.filter(node => isNodeTargetsIncludeId(root, node.id));
}

function getBlankNode(): ApprovalGraphNode {
    return {
        id: `blankId${(Math.random() * 1000).toFixed()}`,
        name: '',
        targets: [],
        approvers: [],
        status: 'not started',
        blank: true
    };
}

function isNodeTargetsIncludeId(node: ApprovalNode, id: string): boolean {
    return node.targets.includes(id);
}
