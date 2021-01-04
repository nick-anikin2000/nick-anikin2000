class Schema {

    constructor() {
        this.nodes = [];
        this.branches = [];
        this.resistors = [];
        this.edsArr = [];
        this.circuits = [];
        this.amperages = [];
        this.matrixA = [];
        this.matrixB = [];
        this.isCreateBranchMode = false;
        this.isCreateResistorMode = false;
        this.isCreateEdsMode = false;
    }

    calculate() {
        for (let i = 0; i < this.nodes.length - 1; i++) {
            let node = [];
            node[i]["amperage"].forEach(el => {
                let checking = el.getAttribute('output');
                let index = el.getAttribute('index');
                if (checking) {
                    node[index - 1] = 1;
                } else {
                    node[index - 1] = -1;
                }
            })


        }
    }

    addNode(node) {
        this.nodes.push(node);
    }

    addBranch(branch) {
        this.branches.push(branch);
    }

    addResistor(resistor) {
        this.resistors.push(resistor);
    }

    addEds(eds) {
        this.edsArr.push(eds);
    }

    addAmperage(amperage) {
        this.amperages.push(amperage);
    }

    addCircuits(circuit) {
        this.circuits.push(circuit);

    }

    deleteElement(component, obj) {
        return function () {
            component.remove();
            let domNodeEl = document.getElementById(obj.DomNode.getAttribute('id'));
            domNodeEl.remove();
            switch (obj.elType) {
                case 'resistor':
                    this.resistor = this.resistor.filter((el) => {
                        return el.name !== obj.name;
                    })
                    break;
                case 'eds':
                    this.edsArr = this.edsArr.filter((el) => {
                        return el.name !== obj.name;
                    })
                    break;
                case 'node':
                    nameControl--;
                    this.nodes = this.nodes.filter((el) => {
                        return el.name !== obj.name;
                    })
                    break;
                case 'dotted':
                    dottedNameControl--;
                    break;
                case 'branch':
                    this.branches = this.branches.filter((el) => {
                        return el.name !== obj.name;
                    })
                    break;
                case 'amperage':
                    this.amperage = this.amperage.filter((el) => {
                        return el.name !== obj.name;
                    })
                    break;
            }
        }
    }

    renderComponentThree(obj, parentNode) {
        let component = document.createElement('div');
        component.className = 'componentThree';
        let deleteBtn = document.createElement('div');
        deleteBtn.textContent = 'x';
        deleteBtn.className = 'deleteBtn';
        let inputValue = document.createElement('input');
        component.textContent = obj.elType + '(' + obj.name + ')';
        deleteBtn.addEventListener('click', this.deleteElement(component, obj).bind(this));

        if (obj.elType === 'resistor' || obj.elType === 'eds') {
            component.append(inputValue);
        }
        component.append(deleteBtn);
        parentNode.append(component);
    }


}

class Element {
    constructor(name) {
        this.name = name;
        this.DomNode = null;
        this.elType = null;
    }

    draw() {
        let el = this.makeSVGEl('g', {id: this.elType + Math.random(), name: this.name});
        this.DomNode = el;

        return el;
    }

    makeSVGEl(tag, attrs) {
        let el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (let k in attrs) {
            el.setAttribute(k, attrs[k]);
        }
        return el;
    }

    move(el, type) {

        let touchobj, boxleft, startx, boxTop, startY;
        let dist = 0;
        let dist2 = 0;


        el.addEventListener('touchstart', function (e) {
            touchobj = e.changedTouches[0] // первая точка соприкосновения для этого события
            if (type === 'node') {
                boxleft = parseInt(el.getAttribute('cx')) // положение блока по левой стороне
                boxTop = parseInt(el.getAttribute('cy'))
            } else {
                boxleft = parseInt(el.getAttribute('x')) // положение блока по левой стороне
                boxTop = parseInt(el.getAttribute('y'))
            }
            startx = parseInt(touchobj.clientX) // получение координаты по x точки соприкосновения
            startY = parseInt(touchobj.clientY) // получение координаты по x точки соприкосновения


        })

        el.addEventListener('touchmove', function (e) {
            touchobj = e.changedTouches[0]// первая точка соприкосновения для этого события
            dist = parseInt(touchobj.clientX) - startx;
            dist2 = parseInt(touchobj.clientY) - startY;// подсчет расстояния перемещения
            // перемещение блока от старновой позиции + дистанция
            if (type === 'node') {
                el.setAttribute('cx', boxleft + dist);
                el.setAttribute('cy', boxTop + dist2);
            } else {
                el.setAttribute('x', boxleft + dist);
                el.setAttribute('y', boxTop + dist2);
            }

        })


        el.addEventListener('mousedown', function (evt) {
            let xStart;
            let yStart;

            if (type === 'node') {
                xStart = el.getAttribute('cx');
                yStart = el.getAttribute('cy');
            } else {
                xStart = el.getAttribute('x');
                yStart = el.getAttribute('y');
            }

            let onMouseMove = function (evtMove) {

                // Отслеживаем изменение координат мыши
                let xNew = xStart - evtMove.clientX;
                let yNew = yStart - evtMove.clientY;

                xStart = evtMove.clientX;
                yStart = evtMove.clientY;
                if (type === 'node') {
                    el.setAttribute('cy', el.getAttribute('cy') - yNew);
                    el.setAttribute('cx', el.getAttribute('cx') - xNew);
                } else {
                    el.setAttribute('y', el.getAttribute('y') - yNew);
                    el.setAttribute('x', el.getAttribute('x') - xNew);
                }

            }
            let onMouseUp = function () {
                // Отменяем подписку на события
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)

        });
    }

}

class Node extends Element {
    constructor(name) {
        super(name);
        this.name = name;
        this.elType = 'node';
        this.amperage = [];
    }

    draw() {
        let el = super.draw();
        let node = this.makeSVGEl('ellipse', {
            ry: "12",
            rx: "12",
            cy: 200,
            cx: 200,
            fill: "red",
            class: 'node',
            elemName: this.name
        })
        el.append(node);
        schemaImg.append(el);
        return node;
    }
}

class Dotted extends Element {
    constructor(name) {
        super(name);
        this.name = name;
        this.elType = 'dotted';
    }

    draw() {
        let el = super.draw();
        let dotted = this.makeSVGEl('rect', {
            height: "14",
            width: "14",
            y: 300,
            x: 300,
            fill: 'green',
            class: 'dotted',
            elemName: this.name
        })

        el.append(dotted);
        schemaImg.append(el);
        return dotted;
    }
}

class Branch extends Element {
    constructor(name) {
        super(name);
        this.name = name;
        this.elType = 'branch';
        this.el =  super.draw();

    }

    draw(prevEl, elem) {
        let sideALength = Math.abs(prevEl.clientX - elem.clientX);
        let sideBLength = Math.abs(prevEl.clientY - elem.clientY);
        let sideCLength = Math.sqrt((sideALength ** 2) + (sideBLength ** 2));
        let rotateAngle = (sideBLength / sideCLength) * (180 / Math.PI);

        let isFirstLeft = prevEl.clientX < elem.clientX;
        let isFirstTop = prevEl.clientY < elem.clientY;

        if ((isFirstLeft && isFirstTop) || (isFirstLeft === false && isFirstTop === false)) {
            rotateAngle += 90;
        } else {
            rotateAngle = 90 - rotateAngle;
        }
        let branch = this.makeSVGEl('line', {
            x1: prevEl.clientX,
            x2: elem.clientX,
            y1: prevEl.clientY,
            y2: elem.clientY,
            deg: rotateAngle,
            class: 'branch',
            style: 'stroke:rgb(255,0,0);stroke-width:2',
        })

        let branchName = this.makeSVGEl('text', {
            x: ((elem.clientX + prevEl.clientX) / 2) + 15,
            y: ((elem.clientY + prevEl.clientY) / 2) + 15,
            style: "font-weight: bold"
        })

        this.el.append(branch);
        this.el.append(branchName);
        schemaImg.append(this.el);
    }
}

class Resistor extends Element {
    constructor(name, parentBranch) {
        super(name);
        this.name = name;
        this.elType = 'resistor';
        this.value = 0;
        this.parentBranch = parentBranch;
    }

    draw(e) {
        let el = super.draw();
        let resistor = this.makeSVGEl('rect', {
            stroke: "#000",
            height: "60.000002",
            width: "24.000001",
            y: e.clientY - 20,
            x: e.clientX - 20,
            style: `stroke:#000000;stroke-width:2; transform: rotate(${e.target.getAttribute('deg')}deg);`,
            fill: "#fff"
        })
        el.append(resistor);
        schemaImg.append(el);
    }
}

class Eds extends Element {
    constructor(name, parentBranch) {
        super(name);
        this.name = name;
        this.elType = 'eds';
        this.value = 0;
        this.direction = true;
        this.parentBranch = parentBranch;
    }

    draw(e) {
        let el = super.draw();
        let eds = this.makeSVGEl('ellipse', {
            ry: "18",
            rx: "18",
            cy: e.clientY -20,
            cx: e.clientX - 20,
            stroke: 'black',
            elemName: this.name,
            style: `stroke:#000000;stroke-width:2; transform: rotate(${e.target.getAttribute('deg')}deg);`,
            fill: "#15f5f1"
        })
        el.append(eds);
        schemaImg.append(el);
    }

}

class Amperage extends Element {
    constructor(name, parentBranch) {
        super(name);
        this.name = name;
        this.elType = 'amperage';
        this.value = 0;
        this.direction = true;
        this.parentBranch = parentBranch;
    }

    draw() {
        let el = super.draw();

    }
}

class Сircuit extends Element {
    constructor(name, branches, nodes, currents) {
        super(name);
        this.name = name;
        this.elType = 'circuit';
        this.direction = true;
        this.branches = branches;
        this.nodes = nodes;
        this.amperages = currents;
    }

    draw() {
        let el = super.draw();

    }
}


let addResistorBtn = document.getElementById('addResistor');
let addBranchBtn = document.getElementById('addBranch');
let addEDSBtn = document.getElementById('addEDS');
let addNodeBtn = document.getElementById('addNode');
let addDottedBtn = document.getElementById('addDotted');
let schemaUI = document.querySelector('.schemaUI');
let componentList = document.getElementById('componentList');
let schemaImg = document.getElementById('schemaImg');
let clearSchemeBtn = document.getElementById('deleteAll');
//////
let nodesList = document.querySelector('.nodesList');
let dottedList = document.querySelector('.dottedList');
let branchesList = document.querySelector('.branchesList');
let resistorsList = document.querySelector('.resistorsList');
let edsList = document.querySelector('.edsList');
//////
let nodesNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
let nameControl = 0;
let dottedNameControl = 1;

let schema = new Schema();

addNodeBtn.addEventListener('click', function () {
    let node = new Node(nodesNames[nameControl]);
    nameControl++;
    schema.addNode(node);
    schema.renderComponentThree(node, nodesList);
    let draw = node.draw();
    node.move(draw, 'node');

})
addDottedBtn.addEventListener('click', function () {
    let dotted = new Dotted(dottedNameControl);
    schema.renderComponentThree(dotted, dottedList);
    dottedNameControl++;
    let draw = dotted.draw();
    dotted.move(draw, 'dotted');
})

addBranchBtn.addEventListener('click', function () {
    schema.isCreateBranchMode = true;
    let branchWay = [];
    let branch = new Branch('branch');
    let nodes = document.querySelectorAll('.node');
    let dotteds = document.querySelectorAll('.dotted');
    nodes.forEach(el => (
        el.addEventListener('click', function (e) {
            if (schema.isCreateBranchMode){
                if (branchWay.length === 0) {
                    branchWay.push({ev: e, nodeName: e.target.getAttribute('elemName')});
                } else {
                    let prevEl = branchWay[branchWay.length - 1]["ev"];
                    let obj = {ev: e, nodeName: e.target.getAttribute('elemName')};
                    branchWay.push(obj);
                    branch.draw(prevEl, obj["ev"]);
                    branch.name = branchWay[0]["nodeName"] + branchWay[branchWay.length - 1]["nodeName"];
                    schema.addBranch(branch);
                    schema.renderComponentThree(branch, branchesList);
                    branchWay = [];
                    schema.isCreateBranchMode = false;

                }
            }


        })
    ))
    dotteds.forEach(el => (
        el.addEventListener('click', function (e) {
            if (schema.isCreateBranchMode){
                if (branchWay.length !== 0) {
                    let prevEl = branchWay[branchWay.length - 1]["ev"];
                    let obj = {ev: e, nodeName: e.target.parentElement.getAttribute('elemName')};
                    branchWay.push(obj);
                    branch.draw(prevEl, obj["ev"]);

                }
            }

        })
    ))
})

addResistorBtn.addEventListener('click', function () {
    schema.isCreateResistorMode = true;
    let branches = document.querySelectorAll('.branch');
    branches.forEach(el=>(
        el.addEventListener('click',function (e){
            if(schema.isCreateResistorMode){
                let resistor = new Resistor(e.target.getAttribute("name"),e.target);
                schema.addResistor(resistor);
                schema.renderComponentThree(resistor, resistorsList);
               resistor.draw(e);
                schema.isCreateResistorMode = false;
            }
        })
    ))
})
addEDSBtn.addEventListener('click', function () {
    schema.isCreateEdsMode = true;
    let branches = document.querySelectorAll('.branch');
    branches.forEach(el=>(
        el.addEventListener('click',function (e){
            if(schema.isCreateEdsMode){
                let eds = new Eds(e.target.getAttribute("name"),e.target);
                schema.addEds(eds);
                schema.renderComponentThree(eds, edsList);
                eds.draw(e);
                schema.isCreateEdsMode = false;
            }
        })
    ))
})

clearSchemeBtn.addEventListener('click', function () {
    let componentThree = Array.from(document.querySelectorAll('.componentThree'));
    componentThree.forEach(el => el.remove());
    schema = new Schema();
    schemaImg.innerHTML = '';
});
