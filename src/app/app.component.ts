import { Component } from '@angular/core';

import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AppService]
})
export class AppComponent {
  public title: string = 'ebook-library';
  public searchTitle: string = "";
  public searchResultsArr: Array<Object> = [];
  public isSearchFailed: boolean = false;
  public isSearchInProgress: boolean = false;
  public resultsCountDetails = null;
  private searchQuery: string = "";
  private optionSelected: string = "open-lib";
  public noResultsFound: boolean = false;

  constructor(private appService: AppService) { }

  /**
   * On option change triggers search if input field has search title
   */
  public onOptionChange() {
    this.searchBooks();
  }

  /**
   * Performs search based on the selected search option
   */
  public searchBooks() {
    if (this.searchTitle) {
      this.noResultsFound = false;
      this.searchResultsArr = [];
      if (this.optionSelected === "open-lib") {
        this.searchOpenLib();
      } else {
        this.searchQuery = this.searchTitle;
        this.searchGoodReads();
      }
    }
  }

  /**
   * Perform open library search
   */
  private searchOpenLib() {
    this.isSearchInProgress = true;
    this.isSearchFailed = false;
    this.appService.getOpenLibSearchResults(this.searchTitle)
      .subscribe(
        (response) => {
          //Handle success response
          this.searchResultsArr = response;
          this.isSearchInProgress = false;
          if (this.searchResultsArr.length === 0) {
            this.noResultsFound = true;
          }
        },
        (err) => {
          //Handle failure response
          this.isSearchInProgress = false;
          this.isSearchFailed = true;
        }
      );
  }

  /**
   * Perform good reads search
   */
  private searchGoodReads(pageNo?: number) {
    this.isSearchInProgress = true;
    this.isSearchFailed = false;
    this.appService.getGoodReadsSearchResults(this.searchTitle, pageNo)
      .subscribe(
        (response) => {
          //Handle success response
          this.searchResultsArr = response.booksArr;
          this.resultsCountDetails = response.resultsCountDetails;
          this.isSearchInProgress = false;
          if (this.searchResultsArr.length === 0) {
            this.noResultsFound = true;
          }
        },
        (err) => {
          //Handle failure response
          this.isSearchInProgress = false;
          this.isSearchFailed = true;
        }
      );
  }
}
