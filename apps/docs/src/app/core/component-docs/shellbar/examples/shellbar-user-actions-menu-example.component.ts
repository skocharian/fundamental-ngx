import { Component } from '@angular/core';
import { ShellbarUser, ShellbarUserMenu } from '@fundamental-ngx/core';

@Component({
    selector: 'fd-shellbar-user-actions-menu-example',
    templateUrl: './shellbar-user-actions-menu-example.component.html'
})
export class ShellbarUserActionsMenuExample {
    user: ShellbarUser = {
        fullName: 'John Doe',
        colorAccent: 11
    };

    settingsCallback(): void {
        alert('Settings Clicked');
    }

    signOutCallback(): void {
        alert('Sign Out Clicked');
    }
}
