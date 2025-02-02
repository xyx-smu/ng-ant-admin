import {Component, OnInit, ChangeDetectionStrategy, OnDestroy, ViewChild, AfterViewInit} from '@angular/core';
import {ThemeService} from "../../core/services/store/theme.service";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {NavDrawerComponent} from "./nav-drawer/nav-drawer.component";
import {RouterOutlet} from "@angular/router";
import {fadeRouteAnimation} from "../../animations/fade.animation";
import {DriverService} from "../../core/services/common/driver.service";
import {WindowService} from "../../core/services/common/window.service";
import {IsFirstLogin} from "../../config/constant";

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    fadeRouteAnimation
  ]
})
export class DefaultComponent implements OnInit, OnDestroy, AfterViewInit {
  isCollapsed$ = this.themesService.getIsCollapsed();
  themeOptions$ = this.themesService.getThemesMode();
  isCollapsed = false;
  isOverMode = false; // 窗口变窄时，导航栏是否变成抽屉模式
  private destory$ = new Subject<void>();
  @ViewChild('navDrawer') navDrawer!: NavDrawerComponent

  constructor(private themesService: ThemeService, private driverService: DriverService, private windowService: WindowService) {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.windowService.getStorage(IsFirstLogin) === "false") {
        return;
      }
      this.windowService.setStorage(IsFirstLogin, "false");
      this.driverService.load();
    }, 500)

  }

  changeCollapsed(): void {
    if (this.isOverMode) {
      this.navDrawer.showDraw();
      return;
    }
    this.isCollapsed = !this.isCollapsed;
    this.themesService.setIsCollapsed(this.isCollapsed);
  }

  // 监听各种流
  subTheme(): void {
    this.themesService.getIsCollapsed().pipe(takeUntil(this.destory$)).subscribe(res => this.isCollapsed = res);
    this.themesService.getIsOverMode().pipe(takeUntil(this.destory$)).subscribe(res => this.isOverMode = res);
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['key'];
  }

  ngOnInit(): void {
    this.subTheme();
  }

  ngOnDestroy(): void {
    this.destory$.next();
    this.destory$.complete();
  }
}
