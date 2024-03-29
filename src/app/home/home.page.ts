import {
  sequence,
  transition,
  trigger,
  useAnimation,
} from '@angular/animations';
import { Component, OnInit } from '@angular/core';

import { BOUNCE_IN_LEFT, BOUNCE_OUT_DOWN, HINGE, TADA } from 'angular-bounce';
import { first } from 'rxjs/operators';

import { FirebaseService } from '../shared/firebase.service';
import { Mot } from '../shared/mot';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  animations: [
    trigger('heroState', [
      transition('* => active', [useAnimation(BOUNCE_IN_LEFT)]),
      transition('* => correct', [useAnimation(TADA)]),
      transition('* => incorrect', [useAnimation(HINGE)]),
    ]),
  ],
})
export class HomePage implements OnInit {
  randomWord: Mot;
  try: string = '';
  probabilityArray: number[] = [];
  id: number;
  state: string = '';
  success: boolean;
  isFirst: boolean = true; 

  constructor(private _firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.state = 'inactive';
    this.getRandomWord();
  }

  getWordId() {
    this._firebaseService.getMotId(this.id.toString()).pipe(first()).subscribe((data) => {
      this.state = 'active';
      this.randomWord = data;
    });
  }

  getRandomWord() {
    this._firebaseService.probabilityJson.pipe(first()).subscribe((data) => {
      this.probabilityArray = JSON.parse(data[0][0]);
      this.foundPercentage(
        JSON.parse(data[0][0]),
        0,
        JSON.parse(data[0][0]).length - 1
      );
      this.getWordId();
    });
  }

  foundPercentage(
    probabilityArray: number[],
    left: number,
    right: number,
    randomNumber?: number
  ) {
    if (!randomNumber) {
      randomNumber = Math.random();
    }

    let pivot = Math.round((right + left) / 2);

    if (right - left == 0) {
      this.id = left;
    } else if (right - left == 1) {
      if (probabilityArray[left] > randomNumber) {
        this.id = left;
      } else {
        this.id = right;
      }
    } else {
      if (probabilityArray[pivot] > randomNumber) {
        if (probabilityArray[pivot - 1] < randomNumber) {
          this.id = pivot;
        } else {
          this.foundPercentage(probabilityArray, left, pivot - 1, randomNumber);
        }
      } else {
        if (probabilityArray[pivot + 1] > randomNumber) {
          this.id = pivot + 1;
        } else {
          this.foundPercentage(
            probabilityArray,
            pivot + 1,
            right,
            randomNumber
          );
        }
      }
    }
  }

  animationDone($event) {
    this.state = $event.toState;

    if (this.state === 'correct' || this.state === 'incorrect') {
      this.state = 'inactive';
    }
    if (this.state === 'inactive') {
      this.getRandomWord();
    }
  }

  updateMot(word: Mot, tryWord: string) {
    this.isFirst = false;
    
    if (word.fr.trim() === tryWord.trim()) {
      this.success = true;
      this.state = 'correct';
    } else if (word.fr.trim() !== tryWord.trim()) {
      this.success = false;
      this.state = 'incorrect';
    }
    this._firebaseService.updateMot(word, this.success, word.id.toString());
    this._firebaseService.updateProbability(
      this.probabilityArray,
      word,
      this.success,
      word.id.toString()
    );
    this.try = '';
  }
}
