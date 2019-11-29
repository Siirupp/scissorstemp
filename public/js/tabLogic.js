$(".nav-tabs").on("click", "a", function(e){
    e.preventDefault()
    $(this).tab('show')
  });

function removeTab(clientid){
    $("#li_"+clientid).remove()
    $("#"+clientid).remove()
    $(".nav-tabs li").children('a').first().click()
}

$('.add-contact').click(function(e, data) {
    if(data){
        if($("#"+data.clientid).length){
            removeTab(data.clientid)
        }
        var id = $(".nav-tabs").children().length
        $(this).closest('li').before('<li><a id="li_' + data.clientid + '" href="#' + data.clientid + '">' + data.hostname + '</a></li>')
        var start = '<div class="tab-pane" id="'+data.clientid +'"> <table class="table">'
        var end = '</table></div>'
        var content = ''
        for (var key in data){
            content += "<tr><th>" + key + "</th><td>" + data[key] + "</td></tr>"
        }
        $('.tab-content').append(start + content + end)
    }
});