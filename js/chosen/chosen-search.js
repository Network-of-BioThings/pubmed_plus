function markupClass(cls) {
  // Wrap the class prefLabel in a span, indicating that the class is obsolete if necessary.
  var max_word_length = 60;
  var label_text = (cls.prefLabel.length > max_word_length) ? cls.prefLabel.substring(0, max_word_length) + "..." : cls.prefLabel;
  var label_html = jQuery("<span/>").addClass('prefLabel').append(label_text);
  if (cls.obsolete === true){
    label_html.removeClass('prefLabel');
    label_html.addClass('obsolete_class');
    label_html.attr('title', 'obsolete class');
  }
  return label_html; // returns a jQuery object; use .prop('outerHTML') to get markup text.
}

var uri_split_chars = "\t::\t";
var uri_split = function(combinedURIs) {
  return combinedURIs.split(uri_split_chars);
};
var uri_combine = function(ont_uri, cls_uri) {
  return ont_uri + uri_split_chars + cls_uri;
};

$("#pubmed_chosen").ajaxChosen({
  minLength    : 3,
  queryLimit   : 10,
  delay        : 500,
  chosenOptions: {width: "350px"},
  searchingText: "Searching for concept ",
  noresultsText: "Concepts not found",
  initialQuery : false
}, function (options, response, event) {
  // jQuery("#resource_index_classes_chzn .chzn-results li.active-result").remove();
  var format = 'jsonp';
  var search_url = "http://data.bioontology.org/search"; // direct REST API
  // var search_url = "/resource_index/search_classes";  // REST API via resource_index_controller::search_classes
  var search_term = jQuery.trim(options.term);
  if (/[^*]$/.test(search_term)) {
    search_term += '*';
  }
  var search_params = {};
  search_params['q'] = search_term;
  search_params['format'] = format;
  search_params['apikey'] = "4ea81d74-8960-4525-810b-fa1baab576ff";
  // NOTE: disabled ontologies selection in the UI, ensure it has no value here.
  // NOTE: ontologies are specified in resource_index_controller::search_classes
  //search_params['ontologies'] = currentOntologyAcronyms().join(',');
  jQuery.ajax({
    url: search_url,
    data: search_params,
    dataType: format,
    success: function(data){
      jQuery("#search_spinner").hide();
      jQuery("#search_results").show();
      var classes = {}, classHTML = "";
      jQuery.each(data.collection, function (index, cls) {
        var cls_id = cls["@id"];
        var ont_id = cls["links"]["ontology"];
        var ont_name = ont_id.split('/').slice(-1)[0];
        classHTML = "" +
          "<span class='search_ontology' title='" + ont_id + "'>" +
            "<span class='search_class' title='" + cls_id + "'>" +
              markupClass(cls).prop('outerHTML') +
              "<span class='search_ontology_acronym'> (" + ont_name + ")</span>" +
          "</span>";
        // Create a combination of ont_id and cls_id that can be split when retrieved.
        // This will be the option value in the selected drop-down list.
        var combined_uri = uri_combine(ont_id, cls_id);
        classes[combined_uri] = classHTML;
      });
      response(classes);  // Chosen plugin creates select list.
    },
    error: function(){
      jQuery("#search_spinner").hide();
      jQuery("#search_results").hide();
      jQuery("#search_messages").html("<span style='color: red'>Problem searching, please try again");
    }
  });
});
