import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MenuItem {
  id?: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  available: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = 'http://localhost:8080/api/menu-items';

  constructor(private http: HttpClient) { }

  getAllMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.apiUrl);
  }

  getMenuItemById(id: number): Observable<MenuItem> {
    return this.http.get<MenuItem>(`${this.apiUrl}/${id}`);
  }

  createMenuItem(item: MenuItem): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.apiUrl, item);
  }
}