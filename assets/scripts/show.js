$(".edit-comment").click(function(){
    var cmnt = $(this).siblings(".text").text();
    $(this).parent().addClass("dn");
    $(this).parent().siblings(".edit-box").removeClass("dn");
});

$(".cancel-comment").click(function(){
    $(this).parent().addClass("dn");
    $(this).parent().siblings(".org-box").removeClass("dn");
});

$("#post-comment").click(function(){
    var cmnt = $("#comment").text();
    $("#hidden-cmnt-box").val(cmnt);
})