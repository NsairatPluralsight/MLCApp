import { Directive, OnInit, OnChanges, ElementRef, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoggerService } from '../services/logger.service';

@Directive({
  selector: '[appNgInclude]'
})
export class NgIncludeDirective implements OnInit, OnChanges {
  @Input() private src: string;
  @Input() private type: string;

  /**
  * @constructor
  * @param {LoggerService} logger - the logger object which used to log errors
  * @param {HttpClient} http - The http object used to make http calls
  * @param {ElementRef} element - an object that is a refrence to the current element
  */
  constructor(private element: ElementRef, private http: HttpClient, private logger: LoggerService) {
  }

  ngOnInit() {
    try {
      this.load();
    } catch (error) {
      this.logger.error(error);
    }
  }

  ngOnChanges() {
    try {
      this.load();
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * Create the script file and append it to the current element
  */
  parseTemplate(res: string) {
    try {
      let newElement;
      if (this.type === 'style') {
        newElement = document.createElement('style');
        newElement.type = 'text/css';

      } else if (this.type === 'script') {
        newElement = document.createElement('script');
        newElement.type = 'text/javascript';
      }

      newElement.appendChild(document.createTextNode(res));
      this.element.nativeElement.innerHTML = '';
      this.element.nativeElement.appendChild(newElement);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * gets the theame files using get request
  * the responc3e handled by the parseTemplate method
  */
  load() {
    try {
      let url = this.src;
      this.http.get(url, {responseType: 'text'}).subscribe(res => this.parseTemplate(res));
    } catch (error) {
      this.logger.error(error);
    }
  }
}
