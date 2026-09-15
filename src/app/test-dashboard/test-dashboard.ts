import { afterNextRender, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestService } from '../core/api/rest.service';
import { GraphqlService } from '../core/api/graphql.service';

@Component({
  selector: 'app-test-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; border: 1px solid #ccc; margin: 20px; border-radius: 8px;">
      <h2>API Test Dashboard</h2>

      <div>
        <h3>REST Status:</h3>
        <pre>{{ restResult() | json }}</pre>
      </div>

      <hr />

      <div>
        <h3>GraphQL Status:</h3>
        <pre>{{ gqlResult() | json }}</pre>
      </div>
    </div>
  `,
})
export class TestDashboard {
  private restService = inject(RestService);
  private graphqlService = inject(GraphqlService);

  restResult = signal<unknown>('Loading REST...');
  gqlResult = signal<unknown>('Loading GraphQL...');

  constructor() {
    afterNextRender(() => {
    this.restService.getUsers().subscribe({
      next: (data) => this.restResult.set(data),
      error: (err) => this.restResult.set(`REST Error: ${err.message}`)
    });

    this.graphqlService.getUsers().subscribe({
      next: (data: unknown) => this.gqlResult.set(data),
      error: (err: Error) => this.gqlResult.set(`GraphQL Error: ${err.message}`)
    });
    });
  }
}
