import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ContextMenuService {

  constructor(private http: HttpClient) { }
}
