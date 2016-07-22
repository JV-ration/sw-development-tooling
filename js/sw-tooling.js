var s = new sigma();

// UI init
$(function() {
    //hide cypher boxes
    $('#toggle-cypher_all').hide();
    $('#import-row').hide();
});

s.addCamera('cam1');
s.addRenderer({
    container: document.getElementById('graph'),
    type: 'canvas',
    camera: 'cam1'
});

function crawlNode(e){
    crawl(e.data.node.id);
}

function crawl(e) {
    console.log("crawl() ID " + e);
}

s.bind('doubleClickNode',crawlNode);

//populate with full data first
doCypherAll();

//Change node color depending on version
function getColor(v) {
    out = '#00BDFC';

    if (v.search(/SNAPSHOT/i) != -1) {
        out = '#FF4E03';

    } else if (v.replace(/[0-9]*(\.[0-9]*)*/g, '').length > 0) {
        out = '#FFD103';

    }
    return out;
}

function doCypher(query, redraw) {

    console.log('doCypher() will execute: ' + query);

    sigma.neo4j.send({
            url: n4jurl,
            user: n4juser,
            password: n4jpassword
        },
        n4jendopint,
        "POST",
        '{"query" : ' + JSON.stringify(query) + '}',
        function(res) {
            if (redraw) {
                redrawGraph(res);
            }
        }
    );
}

function redrawGraph(res) {

    s.graph.clear();

    $.each(res.data, function(i, node) {

        for (k = 0; k < node.length; k++) {

            n = node[k].root.data;

            //if source not exist, create
            if (!s.graph.nodes(n.uniqueId)) {
                s.graph.addNode({
                    id: n.uniqueId,
                    label: n.uniqueId,
                    x: Math.random(),
                    y: Math.random(),
                    size: 1,
                    color: getColor(n.version),
                    border_color: '#00f',
                    border_size: 1
                });
            }

            $.each(node[k].relatives, function(i, rel) {

                //if target not exist, create
                if (!s.graph.nodes(rel[1].data.uniqueId)) {
                    s.graph.addNode({
                        id: rel[1].data.uniqueId,
                        label: rel[1].data.uniqueId,
                        x: Math.random(),
                        y: Math.random(),
                        size: 1,
                        color: getColor(rel[1].data.version),
                        border_color: '#00f',
                        border_size: 1
                    });
                }

                var relUniqueId = n.uniqueId + "-" + rel[0].toLowerCase() + "-" + rel[1].data.uniqueId;
                if (!s.graph.edges(relUniqueId)) {
                    s.graph.addEdge({
                        id: relUniqueId,
                        // Reference extremities:
                        source: n.uniqueId,
                        target: rel[1].data.uniqueId,
                        color: '000',
                        type: 'arrow',
                        label: rel[0].toLowerCase()
                    });
                }

            });
        } //for-k
    });

    s.refresh();
    updateLabel("[" + s.graph.nodes().length + "] Nodes</br>[" + s.graph.edges().length + "] Edges");
}

function getFilterValue(id) {
    var o = $(id).val();
    if (o == undefined || o == "") {
        o = ".*";
        $(id).val(o);
    }
    return o;
}

function refreshData() {
    var query = getFilterValue("#cypher_query");
    doCypher(query, false);
    $('#graph-row').toggle('drop');
    $('#import-row').toggle('drop');
    sleep(1500);
    doCypherAll();
}

function doCypherAll() {

    var query = "MATCH (n)-[r]->(n2) with n, [type(r), n2] as relative";

    query += " WHERE n2.groupId =~ \"" + getFilterValue("#filterG") + "\"";
    query += " AND n2.artifactId =~ \"" + getFilterValue("#filterA") + "\"";
    query += " AND n2.packaging =~ \"" + getFilterValue("#filterP") + "\"";
    query += " AND n2.classifier =~ \"" + getFilterValue("#filterC") + "\"";
    query += " AND n2.version =~ \"" + getFilterValue("#filterV") + "\"";

    query += " AND n.groupId =~ \"" + getFilterValue("#filterG2") + "\"";
    query += " AND n.artifactId =~ \"" + getFilterValue("#filterA2") + "\"";
    query += " AND n.packaging =~ \"" + getFilterValue("#filterP2") + "\"";
    query += " AND n.classifier =~ \"" + getFilterValue("#filterC2") + "\"";
    query += " AND n.version =~ \"" + getFilterValue("#filterV2") + "\"";

    query += " return { root: n, relatives: collect(relative) }";

    $("#cypher_all").val(query);
    doCypher(query, true);
}

function updateLabel(txt){
    $("#graph-label").html(txt);
}

function sleep(miliseconds) {
    var currentTime = new Date().getTime();
    while (currentTime + miliseconds >= new Date().getTime()) {
    }
}
