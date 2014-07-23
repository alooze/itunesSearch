$(document).ready(function () {
    /*
     *Object to hold shared variables and functions.
     */
    var PH = {
        "timeout": 0, //timer used handling key press looking
        "blockCounter": 0, //counter for the gui of the loading widget
        "blockTimeout": 0, //timer used handling loading widget
        "runBlockTimer": function () {
            PH.blockTimeout = setTimeout(function () {
                /*
                 *Create a block every second until search results are posted.  Event is triggered upon initial key press.  Creates the loading GUI.
                 */
                if (PH.blockTimeout !== null) {
                    var $processing = $('#processing');
                    /*
                     * Create 3 blocks then restart until loading is complete to symbolize processing/loading while handling the key presses and ajax loading.
                     */
                    if (PH.blockCounter === 3) {
                        PH.blockCounter = 0;
                        $processing.html("");
                    } else {
                        $processing.append('<div class="square"></div>');
                        PH.blockCounter++;
                    }
                    PH.runBlockTimer();
                }
            }, 1000);
        },
        "stopBlockTimer": function () {
            /*
             *This function will clear the timer for the loading GUI until the timer is triggered again.
             */
            clearTimeout(PH.blockTimeout);
            PH.blockTimeout = null;
            PH.blockCounter = 0;
            $('#processing').html("");
        },
        "lookup": function (searchData) {
            /*
             *Ajax function with jQuery to call apple search API
             */
            $.ajax({
                url: "http://itunes.apple.com/search",
                data: searchData, //Parameters passed, built from the input
                dataType: 'JSONP' //Apple API Returns JSON
            })
                .done(function (data) {
                    //console.log(data);
                    var searchResults = "";
                    $('#results').html("");
                    /*
                     *The JSON format was 2 deep... I loop through the initial result then loop that result to get all the content.
                     */
                    $.each(data['results'], function (i, item) {
                        searchResults += "<div>"; //Build content into a string instead a div... div will be used for formatting
                        $.each(item, function (i, items) {
                            /*
                             * Once I got the information from the JSON I just put it in a string until the end to print out.
                             */
                            searchResults += "<b>" + i + "</b>" + ": <span>" + items + "</span><br/>";
                        });
                        searchResults += "</div><br/>";
                    });
                    /*
                     * We hide old result incase it is not empty, insert new results, fade in to show them, then use the div element to add a css background to give it a zebra effect.
                     */
                    $('#results').hide().html(searchResults).fadeIn().find('div:odd').css("background-color", "#e0e0e0");
                })
                .fail(function (data) {
                    $("#error").html("<br/>A problem connecting to Apple API has occured! Check your connection to the internet!");
                })
                .error(function (data) {
                    $("#error").html("<br/>Your search text has an error! Please refer to proper parameter inputs.");
                });
        }
    }

    /*
     * This will focus on the input at page load, then it binds keyup event.
     */
    $('#search').focus().bind("keyup", function () {
        var search = $('#search').val();
        var searchData = {};
        $("#error").html("");
        $('#results').html("");

        PH.runBlockTimer(); //Start Loading/Processing search GUI widget.

        //Check for input value to not to empty
        if (search.length !== 0) {
            /*
             * Parameter Order: term, country, media, entity, attribute, limit, lang, version, explicit
             * Split the string via , then load all the parameters into an object to be passed with the ajax call.
             */
            search = search.split(",");
            searchData.term = search[0];

            if (search.length > 1) {
                searchData.country = search[1].replace(/^\s+|\s+$/g, "");
            }

            if (search.length > 2) {
                searchData.media = search[2].replace(/^\s+|\s+$/g, "");
            }

            if (search.length > 3) {
                searchData.entity = search[3].replace(/^\s+|\s+$/g, "");
            }

            if (search.length > 4) {
                searchData.attribute = search[4].replace(/^\s+|\s+$/g, "");
            }

            if (search.length > 5) {
                searchData.limit = search[5].replace(/^\s+|\s+$/g, "");
            }

            if (search.length > 6) {
                searchData.lang = search[6].replace(/^\s+|\s+$/g, "");
            }

            if (search.length > 7) {
                searchData.version = search[7].replace(/^\s+|\s+$/g, "");
            }

            if (search.length > 8) {
                searchData.explicit = search[8].replace(/^\s+|\s+$/g, "");
            }

            /*
             *Timer used to listen for key press handle... once user is done typing it will then trigger the ajax function
             *Why the timer... because the ajax calls where happening way to much and was making client work to much when the user was not done.
             */
            if (PH.timeout) {
                clearTimeout(PH.timeout);
                PH.timeout = null;
            }

            PH.timeout = setTimeout(function () {
                PH.lookup(searchData);
                PH.stopBlockTimer();
            }, 1000);

        } else {
            $('#results').html("");
        }
    });

    /*
     * This event is a click handler, it will get the parameter information from apple if you have not already done it, then place it into a div for you to read so you do not have to open a new tab to remember the input rules.
     */
    $('#getHelp').click(function () {
        window.open("http://www.apple.com/itunes/affiliates/resources/documentation/itunes-store-web-service-search-api.html");
        return false;
    });

});