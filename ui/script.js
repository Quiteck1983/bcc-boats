$('#creatormenu').fadeOut(0);

window.addEventListener('message', function(event) {
    const action    = event.data.action;
    const shopData  = event.data.shopData;
    const boatData = event.data.myBoatsData;
    const purchaseConfig = event.data.purchaseConfig; // Assume this is sent from the Lua script

    if (action === "hide") {$("#creatormenu").fadeOut(1000);};
    if (action === "show") {$("#creatormenu").fadeIn(1000);};

    if (shopData) {
        for (const [index, table] of Object.entries(shopData)) {
            const boatType = table.type;
            if ($(`#page_shop .scroll-container .collapsible #${index}`).length <= 0) {
                $('#page_shop .scroll-container .collapsible').append(`
                    <li id="${index}">
                        <div class="collapsible-header col s12 panel ">
                            <div class="col s12 panel-title">
                                <h6 class="grey-text plus">${boatType}</h6>
                            </div>
                        </div>
                        <div class="collapsible-body item-bg"></div>
                    </li>
                `);
            };
            for (const [model, boatData] of Object.entries(table.models)) {
                let ModelBoat;
                const boatLabel = boatData.label;
                const priceCash  = boatData.cashPrice;
                const priceGold  = boatData.goldPrice;

                let buyButtonsHtml = '';
                if (purchaseConfig === 'cash' || purchaseConfig === 'both') {
                    buyButtonsHtml += `
                        <button class="btn-small" onclick="BuyBoat('${model}', true)">
                            <img src="img/money.png"><span class="boat-price">${priceCash}</span>
                        </button>
                    `;
                }
                if (purchaseConfig === 'gold' || purchaseConfig === 'both') {
                    buyButtonsHtml += `
                        <button class="btn-small right-btn" onclick="BuyBoat('${model}', false)">
                            <img src="img/gold.png"><span class="boat-price">${priceGold}</span>
                        </button>
                    `;
                }

                $(`#page_shop .scroll-container .collapsible #${index} .collapsible-body`).append(`
                    <div id="${model}" onhover="loadBoat(this)" class="col s12 panel-shop item">
                        <div class="col s6 panel-col item">
                            <h6 class="grey-text-shop title">${boatLabel}</h6>
                        </div>
                        <div class="buy-buttons">
                            ${buyButtonsHtml}
                        </div>
                    </div>
                `);
                $(`#page_shop .scroll-container .collapsible #${index} .collapsible-body #${model}`).hover(function() {
                    $(this).click(function() {
                        $(ModelBoat).addClass("selected");
                        $('.selected').removeClass("selected");
                        ModelBoat = $(this).attr('id');
                        $(this).addClass('selected');
                        $.post('https://bcc-boats/LoadBoat', JSON.stringify({boatModel: $(this).attr('id')}));
                    });
                }, function() {});
            };
        };
        const location  = event.data.location;
        document.getElementById('shop_name').innerHTML = location;
    };
    if (boatData) {
        $('#page_myboats .scroll-container .collapsible').html('');
        $('.collapsible').collapsible();
        for (const [ind, tab] of Object.entries(boatData)) {
            const boatName = tab.name;
            const boatId = tab.id;
            const boatModel = tab.model;
            $('#page_myboats .scroll-container .collapsible').append(`
                <li>
                    <div id="${boatId}" class="collapsible-header col s12 panel">
                        <div class="col s12 panel-title">
                            <h6 class="grey-text plus">${boatName}</h6>
                        </div>
                    </div>
                    <div class="collapsible-body col s12 panel-myboat item">
                        <button class="col s4 panel-col item-myboat" onclick="Rename(${boatId})">Rename</button>
                        <button class="col s4 panel-col item-myboat" onclick="Spawn(${boatId}, '${boatModel}', '${boatName}')">Launch</button>
                        <button class="col s4 panel-col item-myboat" onclick="Sell(${boatId}, '${boatName}')">Sell</button>
                    </div>
                </li>
            `);
            $(`#page_myboats .scroll-container .collapsible #${boatId}`).hover(function() {
                $(this).click(function() {
                    $.post('https://bcc-boats/LoadMyBoat', JSON.stringify({ BoatId: boatId, BoatModel: boatModel}));
                });
            }, function() {});
        };
    };
});

function BuyBoat(model, isCash) {
    $('#page_myboats .scroll-container .collapsible').html('');
    $('#page_shop .scroll-container .collapsible').html('');
    $("#creatormenu").fadeOut(1000);
    $.post('https://bcc-boats/BuyBoat', JSON.stringify({ Model: model, IsCash: isCash }));
};

function Rename(boatId) {
    $('#page_myboats .scroll-container .collapsible').html('');
    $('#page_shop .scroll-container .collapsible').html('');
    $("#creatormenu").fadeOut(1000);
    $.post('https://bcc-boats/RenameBoat', JSON.stringify({BoatId: boatId}));
}

function Spawn(boatId, boatModel, boatName) {
    $.post('https://bcc-boats/SpawnData', JSON.stringify({ BoatId: boatId, BoatModel: boatModel, BoatName: boatName }));
    $('#page_myboats .scroll-container .collapsible').html('');
    $('#page_shop .scroll-container .collapsible').html('');
    $("#creatormenu").fadeOut(1000);
    CloseMenu()
};

function Sell(boatId, boatName) {
    $.post('https://bcc-boats/SellBoat', JSON.stringify({ BoatId: boatId,  BoatName: boatName}));
    $('#page_myboats .scroll-container .collapsible').html('');
    $('#page_shop .scroll-container .collapsible').html('');
    $("#creatormenu").fadeOut(1000);
};

function Rotate(direction) {
    let rotateBoat = direction;
    $.post('https://bcc-boats/Rotate', JSON.stringify({ RotateBoat: rotateBoat }));
};

function CloseMenu() {
    $.post('https://bcc-boats/CloseMenu');
    $('#page_myboats .scroll-container .collapsible').html('');
    $('#page_shop .scroll-container .collapsible').html('');
    $("#creatormenu").fadeOut(1000);
    ResetMenu();
};

let currentPage = 'page_myboats';
function ResetMenu() {
    $(`#${currentPage}`).hide();
    currentPage = 'page_myboats';
    $('#page_myboats').show();
    $('.menu-selectb.active').removeClass('active');
    $('#button-myboats.menu-selectb').addClass('active');
};

$('.menu-selectb').on('click', function() {
    $(`#${currentPage}`).hide();
    currentPage = $(this).data('target');
    $(`#${currentPage}`).show();
    $('.menu-selectb.active').removeClass('active');
    $(this).addClass('active');
});
