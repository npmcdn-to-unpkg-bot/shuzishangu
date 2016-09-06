var creditCard = $resource('/user/:userId/card/:cardId',{userId:123,cardId:'@id'},{
    charge:{method:'POST',params:{charge:true}}
});

var cards = creditCard.query(function(){
    var card = cards[0];
    expect( card instanceof  creditCard).toEqual(true);
    card.name = 'jhon';
    card.$save();
    card.$charge({amount:9.99});

    var newCard = new creditCard({number:'0123'});
    newCard.name = 'willam';
    newCard.$save();
    expect(newCard.id).toEqual(789);
});