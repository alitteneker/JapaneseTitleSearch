function formatResponseData(responses) {
    if (!responses || responses.length == 0)
        return "<p>no results found</p>"
    let ret = "<ul>";
    for (let response of responses) {
        ret += "<li>"
        ret += `<a href=https://www.amazon.co.jp/s?k=` + response.title + `" target="_blank" rel="noopener noreferrer">` + response.title + "</a> by " + response.author + ' ';
        
        const ISBN = response.ISBN.replace(/-/g, "");
        ret += `<a href="https://www.amazon.co.jp/s?k=` + ISBN + `" target="_blank" rel="noopener noreferrer">(Amazon ISBN)</a> `;
        ret += `<a href="https://www.bookfinder.com/search/?author=&title=&lang=en&submitBtn=Search&new_used=N&destination=jp&currency=USD&binding=*`
            + `&isbn=` + ISBN + `&keywords=&minprice=&maxprice=&publisher=&min_year=&max_year=&mode=advanced&st=sr&ac=qr`
            + `" target="_blank" rel="noopener noreferrer">(Bookfinder ISBN)</a> `;
        ret += `(<a href="` + response.url + `" target="_blank" rel="noopener noreferrer">E-hon</a>)`;
        ret += "</li>"
    }
    return ret + "</ul>";
}

$(document).ready(function(){
    let id_gen = 1;
    let $form = $('form');
    $form.submit(function(){
        const form_data = $(this).serialize();
        const keywords = $("#keywords", this).val();
        const id = "results" + id_gen++;
        
        $('#results-holder').prepend(`<div id="` + id + `"><p><h2>` + keywords + `<img class="loading-img" src="loading.gif" width=20 height=20></img></h2></p></div>`);
        const results = $("#results-holder > div#" + id);
        
        $.post($(this).attr('action'), form_data, function(responses){
            $('.loading-img', results).remove();
            results.append(formatResponseData(responses));
        }, 'json');
        
        $("#keywords", this).val("").focus();
        return false;
    });
});