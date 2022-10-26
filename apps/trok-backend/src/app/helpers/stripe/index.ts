import Stripe from 'stripe';
import { stripe } from '../../utils/clients';

export const handleAuthorizationRequest = async (auth: Stripe.Event.Data.Object) => {
	// Authorize the transaction.
	const auth_obj = <Stripe.Issuing.Authorization>auth
	const res = await stripe.issuing.authorizations.approve(auth_obj.id);
	console.log(res);
	return res;
};