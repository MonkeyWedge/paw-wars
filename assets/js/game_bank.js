$( document ).ready(function() {

  $('#transaction-modal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    // setting all the values from the button
    var id = button.data('id');
    var type = button.data('type');
    var max = button.data('max');
    var friendlyType;
    // get the modal object
    var modal = $(this);
    switch (type){
      case "deposit":
      case "withdraw":
        friendlyType = "Banking Transaction";
        break;
      case "repay":
      case "borrow":
        friendlyType = "Lending Transaction";
        break;
    }
    $('#transaction-amount').attr('max', Number(max));
    // start populating it with values
    $('#transaction-title').html(friendlyType + ": " + type);
    $('#transaction-amount-label').html("How much do you want to " + type + "?");
    var confirmButton = $('#transaction-confirm-btn');
    // start populating the button with data
    confirmButton.data('id', id);
    confirmButton.data('amount', 0);
    confirmButton.data('type', type);
  });

  $('#transaction-amount').on('input', function(e){
    var currentUnits = $(event.target).val();
    var currentPrice = ($(event.target).data('price') * currentUnits).toFixed(2);
  });

  $('#transaction-confirm-btn').on('click', function(e){
    var transaction = {
      id: $(e.target).data('id'),
      type: $(e.target).data('type'),
      amount: $('#transaction-amount').val()
    };
    var reqType;
    var endpoint;
    switch (transaction.type){
      case "deposit":
        reqType = "POST";
        endpoint = "/game/bank/savings";
        break;
      case "withdraw":
        reqType = "GET";
        endpoint = "/game/bank/savings";
        break;
      case "repay":
        reqType = "POST";
        endpoint = "/game/bank/loans";
        break;
      case "borrow":
        reqType = "GET";
        endpoint = "/game/bank/loans";
        break;
    }
    console.log("doing AJAX", reqType, endpoint);
    $.ajax({
      type: reqType, // Use POST with X-HTTP-Method-Override or a straight PUT if appropriate.
      dataType: 'json', // Set datatype - affects Accept header
      url: endpoint, // A valid URL
      data: transaction
    }).done(function(result) {
      if (result.error === false){
        updateDispay(result.life);
        displayAlert("success", "Your transaction was successful!");
      }else{
        displayAlert("warning", "Oh no!  Something has gone wrong (" + result.message + ")");
      }
      $('#transaction-modal').modal('hide');
    }).fail(function(result) {
      displayAlert("danger", "Oh no!  Something has gone terribly wrong (" + JSON.stringify(result, 2, null) + ")");
      $('#transaction-modal').modal('hide');
    });
  });
});

function updateDispay(life){
  // this is what you should use for updating all market status after getting
  // a life object back from the request
  // update the hud
  $("#hud-cash").html(life.current.finance.cash);
  // update all the buttons with maxes
  $("#bank-deposit-btn").data("max",  life.current.finance.cash);
  $("#bank-withdraw-btn").data("max", life.current.finance.savings);
  $("#bank-repay-btn").data("max", life.current.finance.savings);
  $("#bank-savings-amount").html(life.current.finance.savings);
  $("#bank-debt-amount").html(life.current.finance.debt);
  $("#transaction-amount").val(0);
}

function displayAlert(type, message){
  alert = '<div class="alert alert-' + type + ' alert-dismissible" role="alert">';
  alert += '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + message + '</div>';
  $("#alert-container").html(alert);
}
