import { Subscription } from 'rxjs';

Subscription.prototype[Symbol.dispose] = Subscription.prototype.unsubscribe;
