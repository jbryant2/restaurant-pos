import { Injectable, inject } from '@angular/core';
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

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly api = 'http://localhost:8080/api/menu-items';
  private http = inject(HttpClient);

  getAll(): Observable<MenuItem[]> { return this.http.get<MenuItem[]>(this.api); }
  getById(id: number): Observable<MenuItem> { return this.http.get<MenuItem>(`${this.api}/${id}`); }
  getByCategory(category: string): Observable<MenuItem[]> { return this.http.get<MenuItem[]>(`${this.api}/category/${category}`); }
  getAvailable(): Observable<MenuItem[]> { return this.http.get<MenuItem[]>(`${this.api}/available`); }
  create(item: Partial<MenuItem>): Observable<MenuItem> { return this.http.post<MenuItem>(this.api, item); }
  update(id: number, item: Partial<MenuItem>): Observable<MenuItem> { return this.http.put<MenuItem>(`${this.api}/${id}`, item); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/${id}`); }
}
