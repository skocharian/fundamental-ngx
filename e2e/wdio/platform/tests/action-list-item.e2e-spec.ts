import { ActionListItemPo } from '../pages/action-list-item.po';
import { checkAttributeValueTrue, checkElementTextValue } from '../../helper/assertion-helper';
import ActionData from '../fixtures/appData/action-list-item-contents';
import { acceptAlert, click, getAttributeByName, getElementArrayLength, refreshPage, waitForPresent } from '../../driver/wdio';

describe('Action List Item Test Suite:', function() {
    const actionListPage = new ActionListItemPo();
    const {
        actionBtns,
        actionLists,
        actionSections
    } = actionListPage;

    beforeAll(() => {
        actionListPage.open();
    }, 1);

    afterEach(() => {
        refreshPage();
        waitForPresent(actionBtns);
    }, 1);

    describe('Main checks:', function() {
        it('should check actions on click', () => {
            const actionBtnCount = getElementArrayLength(actionBtns);
            for (let i = 0; actionBtnCount > i; i++) {
                click(actionBtns, i);
                acceptAlert();
            }
        });

        it('should check styles', () => {
            checkAttributeValueTrue(actionLists, 'noBorder');
            checkElementTextValue(actionBtns, ActionData.btnText);
            expect(getAttributeByName(actionSections, 'ng-reflect-compact', 0)).toBe('false');
            expect(getAttributeByName(actionSections, 'ng-reflect-compact', 1)).toBe('true');
        });
    });

    describe('Orientation check:', function() {
        it('should check RTL and LTR orientation', () => {
            actionListPage.checkRtlSwitch();
        });
    });

    describe('Check visual regression', function() {
        it('should check examples visual regression', () => {
            actionListPage.saveExampleBaselineScreenshot('action-list-item');
            expect(actionListPage.compareWithBaseline('action-list-item')).toBeLessThan(1);
        });
    });
});
