import { Component, OnInit } from '@angular/core';

import { ModalController } from '@ionic/angular';

import { TranslocoService } from '@jsverse/transloco';
import Chart from 'chart.js/auto';

import { WordTranslation } from '../shared/models/word-translation.model';
import { HomeService } from './services/home.service';
import { Home } from './models/home.interface';
import { ModalAddGoalComponent } from './components/modal-add-goal/modal-add-goal.component';
import { ToastService } from '../shared/services/toast.service';
import { MessagingService } from '../shared/services/messaging.service';
import { applyTheme } from '../shared/utils/apply-theme.util';
import { LANGUAGE_DEFAULT } from '../shared/constants/app.constants';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
})
export class HomePage implements OnInit {
  isDarkMode: boolean = false;
  wordTranslation: WordTranslation;
  home: Home;
  chart: Chart;
  isLoading = true;

  constructor(
    private homeService: HomeService,
    private modalController: ModalController,
    private toastService: ToastService,
    private messagingService: MessagingService,
    private translocoService: TranslocoService
  ) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.isDarkMode = prefersDark.matches;
    applyTheme(this.isDarkMode);
  }

  ngOnInit() {
    const storedIsDarkModeTheme = localStorage.getItem('isDarkMode');
    const storedLanguage = localStorage.getItem('language');
    if (storedIsDarkModeTheme) {
      console.log('storedIsDarkModeTheme', storedIsDarkModeTheme);
      this.isDarkMode = JSON.parse(storedIsDarkModeTheme);
      this.messagingService.setIsDarkMode(JSON.parse(storedIsDarkModeTheme));
      applyTheme(this.isDarkMode);
    }

    if (storedLanguage) {
      this.messagingService.setSelectedLanguage(storedLanguage);
      this.translocoService.setActiveLang(storedLanguage);
    } else {
      this.messagingService.setSelectedLanguage(LANGUAGE_DEFAULT.code);
    }

    this.homeService.getHome().subscribe({
      next: (home) => {
        this.home = home;
        // this.getStatsCharts(home);
        this.messagingService.setHome(home);
        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.showDangerToast(err.error.message);
        // this.loadingService.dismissLoading();
        this.isLoading = false;
      },
    });
  }

  async openModal() {
    const modal = await this.modalController.create({
      component: ModalAddGoalComponent,
      componentProps: {
        goal: this.home.goal,
      },
      cssClass: 'modal-add-goal',
    });
    await modal.present();
  }
}
