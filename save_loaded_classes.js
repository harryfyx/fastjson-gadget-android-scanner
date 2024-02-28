Java.perform(() => {
    Java.enumerateLoadedClasses({
        onMatch: function(className) {
            send(className);
        },
        onComplete: function() {}
    });
    console.log('all done');
})
