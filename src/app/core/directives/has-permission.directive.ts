import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private subscription = new Subscription();
  private hasView = false;

  @Input() appHasPermission: string | string[] = [];
  @Input() appHasPermissionType: 'role' | 'policy' | 'module' = 'policy';
  @Input() appHasPermissionMode: 'any' | 'all' = 'any';

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.updateView();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private updateView(): void {
    const hasPermission = this.checkPermission();

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  private checkPermission(): boolean {
    if (!this.authService.isAuthenticated) {
      return false;
    }

    const permissions = Array.isArray(this.appHasPermission) 
      ? this.appHasPermission 
      : [this.appHasPermission];

    if (permissions.length === 0) {
      return true;
    }

    switch (this.appHasPermissionType) {
      case 'role':
        return this.appHasPermissionMode === 'all' 
          ? this.authService.hasAllRoles(permissions)
          : this.authService.hasAnyRole(permissions);
      
      case 'policy':
        return this.appHasPermissionMode === 'all'
          ? this.authService.hasAllPolicies(permissions)
          : this.authService.hasAnyPolicy(permissions);
      
      case 'module':
        return this.appHasPermissionMode === 'all'
          ? this.authService.hasAllModules(permissions)
          : this.authService.hasAnyModule(permissions);
      
      default:
        return false;
    }
  }
}
