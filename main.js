jQuery(function($) {
    if (document.location.href.includes('#access_token')) {
        console.log("dataportenCallback");
        dashboard.dataporten.dataportenCallback();
    } 
    dashboard.barnehagefakta.process();
});