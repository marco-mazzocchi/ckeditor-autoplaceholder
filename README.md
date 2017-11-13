# ckeditor-autoplaceholder

This plugin will add an inline editable widget to insert placeholder that work with autocompletion.

You have to pass the available token list (the list of key that autocompletion will match) inside condig option like this:

```javascript
var tokenList = {
    'animals.cats.persian': {
        value: '27392032932'
    },
    'animals.cats.korat': {
        value: '51432132312'
    },
    'animals.cats.ragdoll': {
        value: '51212325242'
    },
    'animals.cats.bengal': {
        value: '8732523235'
    },
    'animals.dogs.corgi': {
        value: '241264343'
    },
    'animals.dogs.beagle': {
        value: '24212415156'
    },
    'animals.dogs.collie': {
        value: '64542124252'
    },
    'animals.birds.parrot': {
        value: '6112261235'
    },
    'animals.birds.pigeon': {
        value: '63243151224'
    },
    'animals.bears.grizzly': {
        value: '47328329832'
    },
    'animals.bears.brown': {
        value: '434838933'
    }
};


var editor = CKEDITOR.replace( 'editor' , {
    extraPlugins: 'divarea,autoplaceholder',
    autoplaceholder: {
        tokenList: tokenList,
        defaultText: 'Add Value'
    }
});

editor.on('autoplaceholderTokenMatched', function(e) {
    var $element = e.data.$element;
    var tokenData = e.data.tokenData;
    $element.attr('rel', '{' + tokenData.value + '}');
});

```

Like in the example, you can separate key values with dot to provide a guided suggestion on different steps.
In the example if you type inside the placeholder "anim" it will suggest just "animals". Then when you choose the "animals" option it will suggest "dogs, cats, and birds" and so on.

## Customize default text

You can specify an optional the optional configuration property "defaultText" that will substitute the default value that will appear inside the widget.

## Emitted events

When a token is matched by the autocomplation an event "autoplaceholderTokenMatched" in the editor is fired and will receive inside the data property of the event object the tokenData with everything you set in your custom list.

## Plugin page

[Add Placeholder plugin to CkEditor from the addon page](https://ckeditor.com/cke4/addon/autoplaceholder)
