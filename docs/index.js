let $window = $(window);
let $root = $('html, body');
// Major sections
let $machine = $('.machine');
let $shelves = $('.shelves');
let $selection = $('.selection > ul > li');
let $coins = $('.coins');
let $form = $('form');
let $input_selection = $form.find('[name="selection"]');
let $input_coinage = $form.find('[name="coinage"]');
let $tray = $('.tray');
let $return = $('.coin_return');

// Audit and Inventory
let stock = [{
        cat: 'F',
        name: 'Apple',
        price: 40,
        count: 12
    },
    {
        cat: 'F',
        name: 'Orange',
        price: 30,
        count: 12
    },
    {
        cat: 'F',
        name: 'Grapes',
        price: 80,
        count: 12
    },
    {
        cat: 'P',
        name: 'Red Salted',
        price: 60,
        count: 12
    },
    {
        cat: 'P',
        name: 'Salty Vinegar',
        price: 60,
        count: 12
    },
    {
        cat: 'P',
        name: 'Cheese in Onion',
        price: 60,
        count: 12
    },
    {
        cat: 'S',
        name: 'Kola',
        price: 90,
        count: 12
    },
    {
        cat: 'S',
        name: 'Diet',
        price: 90,
        count: 12
    },
    {
        cat: 'S',
        name: 'Zero',
        price: 90,
        count: 12
    },
];

// Counting items in each category
let cats = {};
// Stock the shelves
$.each(stock, function (i, item) {
    // Count item in category, or add new category
    cats[item.cat] ? cats[item.cat]++ : cats[item.cat] = 1;
    // Create a slot for the item
    let $shelf = $('<div>')
        .addClass('shelf')
        .attr('data-item', item.name.toLowerCase().replace(/\s+/g, '_'))
        .attr('data-cat', item.cat)
        .attr('data-num', cats[item.cat])
        .attr('data-price', item.price)
        .attr('data-stock', item.count)
        .appendTo($shelves);
    // Create an element for the item
    let $item = $('<div>')
        .addClass('item')
        .attr('data-item', item.name.toLowerCase().replace(/\s+/g, '_'))
        .attr('data-cat', item.cat)
        .attr('data-num', cats[item.cat])
        .attr('data-price', item.price)
        .attr('data-stock', item.count)
        .appendTo($shelf);
    let $details = $('<div>')
        .addClass('detail')
        .appendTo($shelf);
    $('<h3>').text(item.name)
        .appendTo($details);
    $('<span>').addClass('code').text('' + item.cat + cats[item.cat])
        .appendTo($details);
    $('<span>').addClass('price').text(item.price)
        .appendTo($details);
});

$selection.find('a').click(function () {
    let $selected = $(this);
    let value = $selected.text();
    let current = $input_selection.val();
    let prev = $selection.find('.active');

    // Clear trays
    $machine.removeClass('vending');
    $tray.empty();
    $return.empty();

    if (!prev.length) {
        $selected.addClass('active');
        $input_selection.val(value);
    }

    // Second press
    if (prev.length === 1) {
        // If letter already pressed and number is pressed
        if (isNaN(prev.first().text()) && !isNaN(value)) {
            $selected.addClass('active');
            $input_selection.val(current + value);
        }
        // If number already pressed and letter is pressed
        if (!isNaN(prev.first().text()) && isNaN(value)) {
            $selected.addClass('active');
            $input_selection.val(value + current);
        }
    }

    // Start new selection
    if (prev.length === 2) {
        $selection.find('a').removeClass('active');
        $input_selection.val('');
        $selected.addClass('active');
        $input_selection.val(value);
    }

});

// Insert coins
$coins.find('a').click(function () {
    // Get useful info
    let $coin = $(this);
    let slot_class = 'slotting';
    let value = parseInt($coin.attr('data-coin'));

    // Clear trays
    $machine.removeClass('vending');
    $tray.empty();
    $return.empty();

    // Animate coin
    $coin.addClass(slot_class);
    $coin.hasClass(slot_class) ? addSound('./music/insertCoin.mp3') : '';
    // Allow new animation
    $coin.bind('webkitAnimationEnd mozAnimationEnd animationEnd', function () {
        $coin.removeClass(slot_class);
    });

    // Update coin display
    coinage = parseInt($input_coinage.val().replace('.', ''));
    new_coin = (coinage ? coinage : 0) + value;
    $input_coinage.val((new_coin / 100).toFixed(2));
});

// On Vend
$form.submit(function (e) {
    // prevent submission
    e.preventDefault();
    // Get useful info
    let code = $input_selection.val().toUpperCase();
    let item = $('.shelf[data-cat="' + code[0] + '"][data-num="' + code[1] + '"]');
    let price = (parseInt(item.attr('data-price')) / 100);
    let coins = parseFloat($input_coinage.val());

    // Item not found
    if (!item.length) {
        $input_selection.addClass('invalid');
        setTimeout(function () {
            $input_selection.removeClass('invalid').val('');
        }, 800);
        return;
    }

    // Check coins
    if (coins < price) {
        $input_coinage.addClass('invalid');
        setTimeout(function () {
            $input_coinage.removeClass('invalid');
        }, 800);
    } else {
        // Calculate change, keep track of returned change
        let change = (coins - price);
        let change_returned = parseFloat(change.toFixed(1));


        // Reset values
        $selection.find('a').removeClass('active');
        $input_selection.val('');
        $input_coinage.val('');

        // Item is placed in tray
        item.find('.item').first().clone().appendTo($tray);

        // Returns 50
        if (change_returned / .5 >= 1) {
            let fifties = parseInt(change_returned / .5);
            change_returned -= (fifties * 0.5);
            for (let i = 0; i < fifties; i++) {
                $coins.find('.coin:eq(0)').clone().appendTo($return);
            }
            change_returned = parseFloat(change_returned.toFixed(1));
        }
        // Returns 20
        if (change_returned / .2 >= 1) {
            let twenties = parseInt(change_returned / .2);
            change_returned -= (twenties * 0.2);
            for (let i = 0; i < twenties; i++) {
                $coins.find('.coin:eq(1)').clone().appendTo($return);
            }
            change_returned = parseFloat(change_returned.toFixed(1));
        }
        // Returns 10
        if (change_returned / .1 >= 1) {
            let tens = parseInt(change_returned / .1);
            change_returned -= (tens * 0.1);
            for (let i = 0; i < tens; i++) {
                $coins.find('.coin:eq(2)').clone().appendTo($return);
            }
        }
        // Position coins in a stack-like fashion
        let pieces = $return.find('.coin');
        if (pieces.length) {
            pieces.each(function (i) {
                let pos = i + 1;
                $(this).css('left', ((-50 * (1 / pieces.length)) * (((pieces.length / 2) + 0.5) - (pos))) + '%');
            });
        }

        // Tell the machine it has vended, for UI animations
        setTimeout(function () {
            $machine.addClass('vending');
        }, 10);
    }
});

// add Sound
function addSound(ele) {
    let audioElementPressKey = document.createElement('audio');
    audioElementPressKey.setAttribute('src', ele);
    audioElementPressKey.setAttribute('autoplay', 'autoplay');
    $.get();
    return audioElementPressKey.play();
}


// Buttons animation
const lis = document.querySelectorAll("li");
const a = document.querySelectorAll("li a");

for (let i = 0; i < lis.length; i++) {
    lis[i].addEventListener("click", function (e) {
        e.preventDefault();
        for (let i = 0; i < lis.length; i++) {
            lis[i].classList.remove("active");
            a[i].classList.remove("active-text");
            // addSound('./music/pressKey.mp3');
        }
        this.classList.add("active").play();
        a[i].classList.add("active-text");
    }, true);
}