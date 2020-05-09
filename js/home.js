$(document).ready(function() {
    // All calculations are done in cents (integers) to avoid floating-point arithmetic
    var cents = 0;

    updateTotalMoneyIn(cents);

    loadItems();

    // Add dollar onclick handler
    $('#add-dollar').click(function() {
        cents += 100;
        updateTotalMoneyIn(cents);
    });

    // Add quarter onclick handler
    $('#add-quarter').click(function() {
        cents += 25;
        updateTotalMoneyIn(cents);
    });

    // Add dime onclick handler
    $('#add-dime').click(function() {
        cents += 10;
        updateTotalMoneyIn(cents);
    });

    // Add nickel onclick handler
    $('#add-nickel').click(function() {
        cents += 5;
        updateTotalMoneyIn(cents);
    });

    // Add make purchase button onlick handler
    $('#make-purchase').click(function() {
        // Convert cents to dollars
        var dollars = cents / 100;

        $.ajax({
            type: 'GET',
            url: 'http://localhost:8080/money/' + dollars + '/item/' + + $('#item').val(),
            success: function(data) {
                // Update message
                $('#message').val('Thank You!!!');

                // Update change input
                var changeString = getChangeString(data);
                $('#change').val(changeString);

                // Update money
                cents = 0;
                updateTotalMoneyIn(cents);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                if (jqXHR.status === 422) {
                    var message = jqXHR.responseJSON.message;
                    $('#message').val(message);
                } else {
                    $('#message').val('Error calling web service. Please try again.');
                }
            }
        });
    });

    // Add change return button onclick handler
    $('#change-return').click(function() {
        if (cents > 0) {
            // Get change
            var changeObject = getChangeObject(cents);

            // Update change input
            var changeString = getChangeString(changeObject);
            $('#change').val(changeString);

            // Update money
            cents = 0;
            updateTotalMoneyIn(cents);
        } else {
            $('#change').val('');
        }

        // Clear inputs
        $('#item, #message').val('');

        // Disable make purchase button
        $('#make-purchase').attr('disabled', true);

        // Update items
        loadItems();
    });
});

// Update total cents in input
function updateTotalMoneyIn(cents) {
    // Convert cents to dollars
    var dollars = cents / 100;
    $('#money').val(dollars.toFixed(2));
}

// Load items
function loadItems() {
    // Clear previous items
    clearItems();

    // Grab the div that holds the rows of items
    var itemRows = $('#item-rows .row');

    $.ajax({
        type: 'GET',
        url: 'http://localhost:8080/items',
        success: function(data) {
            $.each(data, function(index, item) {
                // Create and append column and panel
                var col = '<div class="col-md-4"><div class="panel panel-default"><div class="panel-body">';
                    col += '<p class="text-left">' + item.id + '</p>'
                    col += '<p>' + item.name + '</p>'
                    col += '<p>$' + item.price.toFixed(2) + '</p><br><br>'
                    col += '<p>Quantity Left: ' + item.quantity + '</p>'
                    col += '</div></div></div>';
                    itemRows.append(col);

                // Add panel onclick handler
                itemRows.find('.col-md-4:last .panel').click({id: item.id}, function(event) {
                    // Update item input with id
                    $('#item').val(event.data.id);
                    // Enable make purchase button
                    $('#make-purchase').removeAttr('disabled');
                });
            });
        },
        error: function() {
            $('#message').val('Error calling web service. Please try again.');
        }
    });
}

// Clear items
function clearItems() {
    $('#item-rows .row').empty();
}

// Get change object
function getChangeObject(cents) {
    var quarters = Math.floor(cents / 25);
    cents -= 25 * quarters;
    var dimes = Math.floor(cents / 10);
    cents -= 10 * dimes;
    var nickels = Math.floor(cents / 5);
    cents -= 5 * nickels;
    var pennies = cents;

    return {
        quarters: quarters,
        dimes: dimes,
        nickels: nickels,
        pennies: pennies
    };
}

// Get change string
function getChangeString(changeObject) {
    var changeString = '';
    if (changeObject.quarters) {
        changeString += changeObject.quarters + ' ' + (changeObject.quarters > 1 ? 'Quarters' : 'Quarter') + ' ';
    }
    if (changeObject.dimes) {
        changeString += changeObject.dimes + ' ' + (changeObject.dimes > 1 ? 'Dimes' : 'Dime') + ' ';
    }
    if (changeObject.nickels) {
        changeString += changeObject.nickels + ' ' + (changeObject.nickels > 1 ? 'Nickels' : 'Nickel') + ' ';
    }
    if (changeObject.pennies) {
        changeString += changeObject.pennies + ' ' + (changeObject.pennies > 1 ? 'Pennies' : 'Penny') + ' ';
    }
    return changeString;
}