fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.hasControls = false;

var old_view = [];

function update_view(){
    canvas.deactivateAll();
    var changed = [];
    var view_objs = [];
    var arr = canvas.getObjects()
    for (i = 0; i < arr.length; i++){
	if(arr[i].changed){
	    changed.push(i);
	    view_objs.push(arr[i]);
	}
    }
    console.log(arr);
    console.log(view_objs);
    socket.emit('get_projection', {'changed':changed,'view':get_normalised_coords(view_objs),'old':old_view});
}

function get_normalised_coords(objs){
    var answer = [];
    for(var i = 0; i < objs.length; i++){
	answer.push([objs[i].getLeft()/canvas.width,objs[i].getTop()/canvas.height])
    }
    return answer;
}

function get_display_coords(x,y){
    return [x*canvas.width,y*canvas.height];
}

var socket = io.connect('http://localhost:3797/elderberry');
socket.on('projection', function(msg) {
    canvas.clear().renderAll();
    var data = msg['data'];
    console.log("DD", JSON.stringify(data));
    for (i = 0; i < data.length; i++) {

	info_array.push(data[i][2])
	coords = get_display_coords(data[i][0],data[i][1]);
	dot = new fabric.Circle({
	    left:   coords[0],
	    top:    coords[1],
	    radius: 9,
	    fill:   rainbow[data[i][2]]
	});
	dot.setOriginX("center");
	dot.setOriginY("center");
	dot.hasControls = false;

	canvas.add(dot);
    }
    canvas.renderAll();
    var arr = canvas.getObjects()
    for (i = 0; i < arr.length; i++){
	arr[i].changed = false;
	old_view.push([arr[i].getLeft(), arr[i].getTop()]);
    }
});

canvas = new fabric.Canvas('c1', { backgroundColor: "#000" });
var info_array = []

socket.on('connect', function() {});
socket.emit('init_projection', {});

var i, dot,
    rainbow = ["#ffcc66", "#ccff66", "#66ccff", "#ff6fcf", "#ff6666"];

results1 = document.getElementById('results-c1');

function animate(e, dir) {
    if (e.target) {
	fabric.util.animate({
	    onChange: function(value) {
		data = {};
		if (canvas.getActiveGroup() != undefined){
		    for (i in canvas.getObjects()){
			
			if (canvas.getObjects()[i].active){
			    data[i] = [
				canvas.getObjects()[i].getLeft() + canvas.getActiveGroup().left, 
				canvas.getObjects()[i].getTop()  + canvas.getActiveGroup().top
			    ];
			}
		    }
		}
		else{
		    data['singleton'] = e.target.setCoords();
		}
	    },
	    onComplete: function() {}
	});
    }
}

canvas.on('object:moving', function(e) { 
    animate(e, 1);
});

canvas.on('selection:created', function(e) { 

    selected = e.target.objects
    datatable = []
    for(i in selected){
	temp = []
	index = canvas.getObjects().indexOf(selected[i])
	desc = info_array[index]
	if (index != -1){
	    temp.push(i+1)
	    temp.push(index)
	    temp.push(desc)
	    datatable.push(temp)
	}
    }
    
    console.log("datatable");
    createTable(datatable);

    
})

canvas.on('object:selected', function(e) { 

    datatable = []
    temp = []
    index = canvas.getObjects().indexOf(e.target)
    desc = info_array[index]
    if (index != -1){
	temp.push(i+1)
	temp.push(index)
	temp.push(desc)
	datatable.push(temp)
    }
    
    console.log("datatable22");
    createTable(datatable);

    
})

canvas.on('object:modified', function(e) { 
    if (canvas.getActiveGroup() != undefined){
	var arr = canvas.getObjects()
	for (i = 0; i < arr.length; i++){
	    if (arr[i].active){
		arr[i].changed = true;
		console.log("C",arr[i]);
	    }
	}
    }
    else e.target.changed = true;
});

points = canvas._objects
info = info_array
