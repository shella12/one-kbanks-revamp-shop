import { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard, Lock, Truck, MapPin } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import paymentService, { ShippingAddress, BillingAddress } from '@/services/payment.service';
import { toast } from 'sonner';

const checkoutSchema = z.object({
  // Shipping Address
  shippingName: z.string().min(2, 'Name is required'),
  shippingEmail: z.string().email('Valid email is required'),
  shippingPhone: z.string().min(10, 'Phone number is required'),
  shippingStreet: z.string().min(5, 'Street address is required'),
  shippingCity: z.string().min(2, 'City is required'),
  shippingState: z.string().min(2, 'State is required'),
  shippingZipCode: z.string().min(5, 'ZIP code is required'),
  shippingCountry: z.string().default('US'),
  
  // Billing Address
  billingName: z.string().min(2, 'Name is required'),
  billingStreet: z.string().min(5, 'Street address is required'),
  billingCity: z.string().min(2, 'City is required'),
  billingState: z.string().min(2, 'State is required'),
  billingZipCode: z.string().min(5, 'ZIP code is required'),
  billingCountry: z.string().default('US'),
  
  // Options
  sameAsShipping: z.boolean().default(false),
  savePaymentMethod: z.boolean().default(false),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  onSuccess: (order: any) => void;
}

export const CheckoutForm = ({ onSuccess }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingName: user?.name || '',
      shippingEmail: user?.email || '',
      shippingPhone: user?.phoneNumber || '',
      shippingStreet: user?.address?.street || '',
      shippingCity: user?.address?.city || '',
      shippingState: user?.address?.state || '',
      shippingZipCode: user?.address?.zipCode || '',
      shippingCountry: user?.address?.country || 'US',
      billingName: user?.name || '',
      billingCountry: 'US',
      sameAsShipping: true,
      savePaymentMethod: false,
    },
  });

  const watchSameAsShipping = watch('sameAsShipping');
  const watchShippingFields = watch([
    'shippingName',
    'shippingStreet',
    'shippingCity',
    'shippingState',
    'shippingZipCode',
    'shippingCountry'
  ]);

  // Auto-fill billing address when "same as shipping" is checked
  useEffect(() => {
    if (watchSameAsShipping) {
      setValue('billingName', watchShippingFields[0]);
      setValue('billingStreet', watchShippingFields[1]);
      setValue('billingCity', watchShippingFields[2]);
      setValue('billingState', watchShippingFields[3]);
      setValue('billingZipCode', watchShippingFields[4]);
      setValue('billingCountry', watchShippingFields[5]);
    }
  }, [watchSameAsShipping, watchShippingFields, setValue]);

  const createPaymentIntent = async (formData: CheckoutFormData) => {
    const shippingAddress: ShippingAddress = {
      name: formData.shippingName,
      email: formData.shippingEmail,
      phone: formData.shippingPhone,
      street: formData.shippingStreet,
      city: formData.shippingCity,
      state: formData.shippingState,
      country: formData.shippingCountry,
      zipCode: formData.shippingZipCode,
    };

    const billingAddress: BillingAddress = {
      name: formData.billingName,
      street: formData.billingStreet,
      city: formData.billingCity,
      state: formData.billingState,
      country: formData.billingCountry,
      zipCode: formData.billingZipCode,
    };

    const intent = await paymentService.createPaymentIntent({
      shippingAddress,
      billingAddress,
    });

    setPaymentIntent(intent);
    return intent;
  };

  const onSubmit = async (formData: CheckoutFormData) => {
    if (!stripe || !elements) {
      toast.error('Stripe not loaded');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Create payment intent
      const intent = await createPaymentIntent(formData);

      // Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment
      const { error, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
        intent.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: formData.billingName,
              email: formData.shippingEmail,
              phone: formData.shippingPhone,
              address: {
                line1: formData.billingStreet,
                city: formData.billingCity,
                state: formData.billingState,
                postal_code: formData.billingZipCode,
                country: formData.billingCountry,
              },
            },
          },
          shipping: {
            name: formData.shippingName,
            phone: formData.shippingPhone,
            address: {
              line1: formData.shippingStreet,
              city: formData.shippingCity,
              state: formData.shippingState,
              postal_code: formData.shippingZipCode,
              country: formData.shippingCountry,
            },
          },
        }
      );

      if (error) {
        setPaymentError(error.message || 'Payment failed');
        return;
      }

      if (confirmedPayment?.status === 'succeeded') {
        // Confirm payment on backend
        const shippingAddress: ShippingAddress = {
          name: formData.shippingName,
          email: formData.shippingEmail,
          phone: formData.shippingPhone,
          street: formData.shippingStreet,
          city: formData.shippingCity,
          state: formData.shippingState,
          country: formData.shippingCountry,
          zipCode: formData.shippingZipCode,
        };

        const billingAddress: BillingAddress = {
          name: formData.billingName,
          street: formData.billingStreet,
          city: formData.billingCity,
          state: formData.billingState,
          country: formData.billingCountry,
          zipCode: formData.billingZipCode,
        };

        const order = await paymentService.confirmPayment({
          paymentIntentId: confirmedPayment.id,
          shippingAddress,
          billingAddress,
        });

        // Save payment method if requested
        if (formData.savePaymentMethod && confirmedPayment.payment_method) {
          try {
            await paymentService.savePaymentMethod(confirmedPayment.payment_method as string);
          } catch (error) {
            console.error('Failed to save payment method:', error);
          }
        }

        refreshCart();
        onSuccess(order);
      }
    } catch (error: any) {
      setPaymentError(error.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Your cart is empty</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shippingName">Full Name</Label>
              <Input
                id="shippingName"
                {...register('shippingName')}
                className={errors.shippingName ? 'border-destructive' : ''}
              />
              {errors.shippingName && (
                <p className="text-sm text-destructive mt-1">{errors.shippingName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="shippingEmail">Email</Label>
              <Input
                id="shippingEmail"
                type="email"
                {...register('shippingEmail')}
                className={errors.shippingEmail ? 'border-destructive' : ''}
              />
              {errors.shippingEmail && (
                <p className="text-sm text-destructive mt-1">{errors.shippingEmail.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="shippingPhone">Phone Number</Label>
            <Input
              id="shippingPhone"
              type="tel"
              {...register('shippingPhone')}
              className={errors.shippingPhone ? 'border-destructive' : ''}
            />
            {errors.shippingPhone && (
              <p className="text-sm text-destructive mt-1">{errors.shippingPhone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="shippingStreet">Street Address</Label>
            <Input
              id="shippingStreet"
              {...register('shippingStreet')}
              className={errors.shippingStreet ? 'border-destructive' : ''}
            />
            {errors.shippingStreet && (
              <p className="text-sm text-destructive mt-1">{errors.shippingStreet.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="shippingCity">City</Label>
              <Input
                id="shippingCity"
                {...register('shippingCity')}
                className={errors.shippingCity ? 'border-destructive' : ''}
              />
              {errors.shippingCity && (
                <p className="text-sm text-destructive mt-1">{errors.shippingCity.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="shippingState">State</Label>
              <Input
                id="shippingState"
                {...register('shippingState')}
                className={errors.shippingState ? 'border-destructive' : ''}
              />
              {errors.shippingState && (
                <p className="text-sm text-destructive mt-1">{errors.shippingState.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="shippingZipCode">ZIP Code</Label>
              <Input
                id="shippingZipCode"
                {...register('shippingZipCode')}
                className={errors.shippingZipCode ? 'border-destructive' : ''}
              />
              {errors.shippingZipCode && (
                <p className="text-sm text-destructive mt-1">{errors.shippingZipCode.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Billing Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sameAsShipping"
              checked={watchSameAsShipping}
              onCheckedChange={(checked) => setValue('sameAsShipping', checked as boolean)}
            />
            <Label htmlFor="sameAsShipping">Same as shipping address</Label>
          </div>

          {!watchSameAsShipping && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="billingName">Full Name</Label>
                <Input
                  id="billingName"
                  {...register('billingName')}
                  className={errors.billingName ? 'border-destructive' : ''}
                />
                {errors.billingName && (
                  <p className="text-sm text-destructive mt-1">{errors.billingName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="billingStreet">Street Address</Label>
                <Input
                  id="billingStreet"
                  {...register('billingStreet')}
                  className={errors.billingStreet ? 'border-destructive' : ''}
                />
                {errors.billingStreet && (
                  <p className="text-sm text-destructive mt-1">{errors.billingStreet.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="billingCity">City</Label>
                  <Input
                    id="billingCity"
                    {...register('billingCity')}
                    className={errors.billingCity ? 'border-destructive' : ''}
                  />
                  {errors.billingCity && (
                    <p className="text-sm text-destructive mt-1">{errors.billingCity.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="billingState">State</Label>
                  <Input
                    id="billingState"
                    {...register('billingState')}
                    className={errors.billingState ? 'border-destructive' : ''}
                  />
                  {errors.billingState && (
                    <p className="text-sm text-destructive mt-1">{errors.billingState.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="billingZipCode">ZIP Code</Label>
                  <Input
                    id="billingZipCode"
                    {...register('billingZipCode')}
                    className={errors.billingZipCode ? 'border-destructive' : ''}
                  />
                  {errors.billingZipCode && (
                    <p className="text-sm text-destructive mt-1">{errors.billingZipCode.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <CardElement options={cardElementOptions} />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="savePaymentMethod"
              checked={watch('savePaymentMethod')}
              onCheckedChange={(checked) => setValue('savePaymentMethod', checked as boolean)}
            />
            <Label htmlFor="savePaymentMethod">Save payment method for future purchases</Label>
          </div>

          {paymentError && (
            <Alert variant="destructive">
              <AlertDescription>{paymentError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Order Summary */}
      {paymentIntent && (
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{paymentService.formatPrice(paymentIntent.orderSummary.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>
                {paymentIntent.orderSummary.shipping === 0 ? 'Free' : paymentService.formatPrice(paymentIntent.orderSummary.shipping)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{paymentService.formatPrice(paymentIntent.orderSummary.tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{paymentService.formatPrice(paymentIntent.orderSummary.total)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!stripe || isProcessing}
      >
        <Lock className="h-4 w-4 mr-2" />
        {isProcessing ? 'Processing...' : `Pay ${paymentIntent ? paymentService.formatPrice(paymentIntent.amount) : ''}`}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        🔒 Your payment information is secure and encrypted
      </div>
    </form>
  );
};