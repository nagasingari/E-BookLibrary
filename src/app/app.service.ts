import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { NgxXml2jsonService } from 'ngx-xml2json';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/xml',
    'Accept': 'application/xml'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private goodReadsSearchUrl = "https://www.goodreads.com/search/index.xml?";
  private openLibrarySearchUrl = "http://openlibrary.org/search.json?title=";
  private key = "P4RB1vBcHb1cgBYNytVYCQ";

  constructor(
    private http: HttpClient,
    private xml2jsonService: NgxXml2jsonService
  ) {

  }

  /**
   * Peforms Good Reads Search
   * @param title Title to search
   * @param pageNo optional pagination number
   */
  public getGoodReadsSearchResults(title, pageNo?: number): Observable<any> {
    let url = this.goodReadsSearchUrl + "key=" + this.key + "&q=" + encodeURIComponent(title) + "&search=title";
    if (pageNo) {
      url += "&page=" + pageNo;
    }
    return this.http.get(url, { responseType: 'text' })
      .pipe(
        map(res => {
          const parser = new DOMParser();
          const resXml = parser.parseFromString(res, 'text/xml');
          const resJson = this.xml2jsonService.xmlToJson(resXml);
          console.error(resJson);
          return this.processGoodReadsResponse(resJson);
        }),
        catchError(err => {
          console.error(err);
          return throwError("Unable to fetch results");
        })
      );
  }

  /**
   * Processes good reads response
   * @param response Response to process
   */
  private processGoodReadsResponse(response: any): Object {
    let processedResData = {
      booksArr: [],
      resultsCountDetails: {}
    };
    if (response.GoodreadsResponse &&
      response.GoodreadsResponse.search) {
      let search = response.GoodreadsResponse.search;
      processedResData.resultsCountDetails['resultsStart'] = parseInt(search['results-start']);
      processedResData.resultsCountDetails['resultsEnd'] = parseInt(search['results-end']);
      processedResData.resultsCountDetails['resultsTotal'] = parseInt(search['total-results']);
      if (response.GoodreadsResponse.search.results &&
        response.GoodreadsResponse.search.results.work) {
        let work = response.GoodreadsResponse.search.results.work;
        if (!Array.isArray(work)) {
          processedResData.booksArr = [work];
        } else {
          work.sort((a, b) => {
            if (a.best_book.title > b.best_book.title) {
              return 1;
            } else {
              return -1;
            }
          });
          processedResData.booksArr = work;
        }
      }
      return processedResData;
    }
  }

  /**
   * Peforms good reads search
   * @param title Title to search
   */
  public getOpenLibSearchResults(title): Observable<any> {
    let url: string = this.openLibrarySearchUrl + this.getQueryParamVal(title);
    console.log(url);
    return this.http.get(url)
      .pipe(
        map(response => this.processOpenLibResponse(response)),
        catchError(err => {
          return throwError("Unable to fetch results");
        })
      );
  }

  /**
   * Processes open lib response
   * @param response Response to process
   */
  private processOpenLibResponse(response: any): Array<Object> {
    if (response.docs) {
      if (!Array.isArray(response.docs)) {
        return response.docs = [response.docs];
      }
      response.docs.sort((a, b) => {
        if (a.title > b.title) {
          return 1;
        } else {
          return -1;
        }
      });
      return response.docs;
    } else {
      return [];
    }
  }

  private getQueryParamVal(title) {
    return title.trim().replace(/\s\s+/g, ' ').split(' ').join('+');
  }
}
