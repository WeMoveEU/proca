import { useLayoutEffect, useState } from 'react';

const usePaypal = params => {
  const [loadState, setLoadState] = useState({ loading: false, loaded: false });

  useLayoutEffect(() => {
    if (loadState.loading || loadState.loaded) return;
    setLoadState({ loading: true, loaded: false });

    const script = document.createElement('script');
    script.src =  "https://www.paypal.com/sdk/js?currency=EUR&client-id=" + (params.clientId || "sb");
    script.async = true;
    script.addEventListener('load', function() {
      setLoadState({ loading: false, loaded: true });
      const paypal = window.paypal; 
      const button = paypal.Buttons({
        aaacreateOrder: function(data, actions) {
          console.log("create order",data);
          return actions.order.create({
            purchase_units: [{amount:{value:'1.00'}}],
            description: 'Support',
          });
        },
        fundingSource: paypal.FUNDING.PAYPAL,
        commit:true,
            onClick: function(data,actions) {
                console.log("onClick",data);
//                return actions.reject(Error("error: onClick"));
            },
                    onCancel: function(data,actions) {
              console.log("onCancel");
            },
        onApprove: function(data, actions) {
          console.log("onApprove");
          return actions.order.capture().then(function(details) {
            alert('Transaction completed by ' + details.payer.name.given_name + '!');
          });
        },

        onError: function(err) {
          console.log("error",err);
        },
        style: {
          shape: 'rect',
          color: 'silver',
          size: 'responsive',
          height: 30,
          layout: 'vertical',
          label: 'paypal',
        }
      });
      button.render(params.dom || "#paypal-container");
    });
    document.body.appendChild(script);
    return () => { console.log("unload");//document.body.removeChild(script); 
    }
  }, [loadState,params]);
};
export default usePaypal;

/* old school
<form action="https://www.paypal.com/donate" method="post" target="_top">
<input type="hidden" name="cmd" value="_donations" />
<input type="hidden" name="business" value="account@example.org" />
<input type="hidden" name="currency_code" value="EUR" />
<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
<img alt="" border="0" src="https://www.paypal.com/en_DE/i/scr/pixel.gif" width="1" height="1" />
</form>

<div id="smart-button-container">
      <div style="text-align: center;">
        <div id="paypal-button-container"></div>
      </div>
    </div>
  <script src="https://www.paypal.com/sdk/js?client-id=sb&currency=EUR" data-sdk-integration-source="button-factory"></script>
  <script>
    function initPayPalButton() {
      paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'paypal',
          
        },

        createOrder: function(data, actions) {
          return actions.order.create({
            purchase_units: [{"amount":{"currency_code":"EUR","value":1}}]
          });
        },

        onApprove: function(data, actions) {
          return actions.order.capture().then(function(details) {
            alert('Transaction completed by ' + details.payer.name.given_name + '!');
          });
        },

        onError: function(err) {
          console.log(err);
        }
      }).render('#paypal-button-container');
    }
    initPayPalButton();
  </script>
*/
