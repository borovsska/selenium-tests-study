# selenium-tests-study

UI-tests to practice Selenium

### Installing
```
npm ci
```

### How to run tests
```
npm run test
```

Not all tests might pass because I use third-party sites and they constantly change.

### What the tests are about
* test cases for [9292.nl](https://9292.nl/):
    * home page;
    * prices page (https://9292.nl/prijzen-en-abonnementen/reizen-op-rekening);
    * trip page (e.g. https://9292.nl/reisadvies/station-amsterdam-centraal/station-alkmaar/vertrek/); 

* test cases for [asos.com](https://www.asos.com/nl/dames/):
    * home page;
    * product page (e.g. [dress](https://www.asos.com/nl/asos-design/asos-design-schouderloze-maxi-jurk-met-bloemenprint/prd/12978097?clr=multi&colourWayId=16450741&SearchQuery=&cid=2623));
    * [registration page](https://my.asos.com/identity/register?lang=nl-NL&store=NL&country=NL&keyStoreDataversion=p1swt7e-15&returnUrl=https%3A%2F%2Fwww.asos.com%2Fnl%2Fdames%2F);

* test case for [nsinternational.nl](https://www.nsinternational.nl/en):
    * home page;

* test cases for [thuisbezorgd.nl](https://www.thuisbezorgd.nl/en/):
    * home page;
    * restaurant page (e.g. [Sumo Take Away & Delivery](https://www.thuisbezorgd.nl/en/sumo-take-away-delivery-amsterdam-nieuwezijds-voorburgwal));
    * page with a list of restaurants at a specific address (e.g. https://www.thuisbezorgd.nl/en/order-takeaway-amsterdam-1016);

* test case for [trustpilot.nl](https://nl.trustpilot.com):
    * review page (e.g. https://nl.trustpilot.com/review/www.bol.com)     
 


### Used technologies
* JavaScript
* Jest
* Selenium WebDriver
* CSS (mostly selectors)
