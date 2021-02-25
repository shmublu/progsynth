const { truncate } = require('fs');
const v8 = require('v8');
const structuredClone = obj => {  return v8.deserialize(v8.serialize(obj));};
var treeDupes = function treeDuplicate(tree) {
    if(!Array.isArray(tree)) {return tree;}
    else {
        var n = turnArrayToTree(tree);
        var nList = getAllLevelPerms(n);
        //preOrder(n);
        var a = getLongestPermPattern(n, nList);
        //console.log(a);
        if(a!=null && a[1] > 1) {
            spliceRepeatNodeIntoTree(n, a);
            //preOrder(n);
            //console.log(turnTreeToArray(n))
            return (turnTreeToArray(n));
        }

        

    }

    return tree;
}
//Takes the root node of the pattern and the output of getLongestPermPattern() and turns it into a repeat node
function spliceRepeatNodeIntoTree(rootNodeOfPattern, outputOfGetLongestPermPattern) {
    var permArray =structuredClone(outputOfGetLongestPermPattern);
    var terminalNodeOfPattern= permArray[0];
    for(var i = 0; i < permArray[3].length; i++) {
        if(terminalNodeOfPattern.listOfChildren!=null && terminalNodeOfPattern.listOfChildren.length > permArray[3][i]){
            terminalNodeOfPattern= terminalNodeOfPattern.listOfChildren[permArray[3][i]];
        }
        else {
            console.error("Placeholder navigation/finder experienced an error.")
            return null;
        }
    }
    terminalNodeOfPattern.data = "placeholder"
    terminalNodeOfPattern.listOfChildren=null;
    var newListOfKids = [permArray[0], new Node(permArray[1], null, false), permArray[2]];
    rootNodeOfPattern.listOfChildren=newListOfKids;
    rootNodeOfPattern.data = "repeat"

}
//This method takes in a nodedTree and an array of placeholder trees- it will find the longest pattern in the nodedTree
function getLongestPermPattern(nodedTree,placeholderTreeList) {
    var longestPatternRepitition= 0;
    var longestPattern = null;
    for(var i = 0; i<placeholderTreeList.length; i++) {
        var testedPatternRepeatAmount =compareTreePerm(nodedTree, placeholderTreeList[i]);
        if(testedPatternRepeatAmount>longestPatternRepitition) {
            longestPatternRepitition=testedPatternRepeatAmount;
            longestPattern=placeholderTreeList[i];
        }
    } 
    if(longestPattern!=null && longestPatternRepitition > 1) {
        var placeholderNav = findPlaceholderLocation(longestPattern);
        //Find whatever occurs after the pattern ends
        var terminalNodeOfPattern= nodedTree;
        for(var i = 0; i < longestPatternRepitition; i++) {
            for(var j = 0; j < placeholderNav.length; j++) {
                if(terminalNodeOfPattern.listOfChildren!=null && terminalNodeOfPattern.listOfChildren.length > placeholderNav[j]){
                    terminalNodeOfPattern= terminalNodeOfPattern.listOfChildren[placeholderNav[j]];
                }
                else {
                    console.error("Placeholder navigation/finder experienced an error.")
                    return null;
                }
        }
    }
        return [longestPattern, longestPatternRepitition, terminalNodeOfPattern, placeholderNav];
    
    }
    
}
//Takes in one nodedTree and one placeholderTree- sees how many times that specific pattern repeats
function compareTreePerm(nodedTree, placeholderTree) {
    var childRunThruOrder = findPlaceholderLocation(placeholderTree);
    var baseNodePointer = nodedTree;
    var repeatAmount = 1;
    //navigate to the placeholder node in the main tree
    for(var i = 0; i < childRunThruOrder.length; i++) {
        baseNodePointer= baseNodePointer.listOfChildren[childRunThruOrder[i]];
    }
    while(treeComparer(baseNodePointer, placeholderTree)) {
        repeatAmount++;
        var makeItThru = true;
        for(var i = 0; i < childRunThruOrder.length; i++) {
            if(baseNodePointer.listOfChildren!=null && baseNodePointer.listOfChildren.length > childRunThruOrder[i]){
            baseNodePointer= baseNodePointer.listOfChildren[childRunThruOrder[i]];
            }
            else {
                makeItThru=false
                break;
            }
        }
        if(makeItThru==false) {
            break;
        }
    }
    return repeatAmount;
}
//Compares two nodedTrees for equality. Placeholders are definitionally equal to any other node.
function treeComparer(tree, placeholderTree) {
    if(tree==null && placeholderTree==null) {
        return true;
    }
    else if(tree==null || placeholderTree==null) {
        return false;
    }
    else if(placeholderTree.isPlaceholder) {
        return true;
    }
    else if(!areNodesEqual(tree,placeholderTree)) {
        return false;
    }
    else {
        if(tree.listOfChildren==null && placeholderTree.listOfChildren==null) {
            return true;
        }
        else if(tree.listOfChildren==null || placeholderTree.listOfChildren==null) {
            return false;
        }
        else if(tree.listOfChildren.length==placeholderTree.listOfChildren.length) {
        for(var i = 0; i < tree.listOfChildren.length; i++) {
            var b1 = treeComparer(tree.listOfChildren[i], placeholderTree.listOfChildren[i])
            if(b1==false) {
                return false;
            }
        }
        return true;
        }
        return false;
    }
}

function treePermsAtLevel(nodedTree1, sdepth) {
    var nodedTree = structuredClone(nodedTree1);
    if(nodedTree==null) {
        return null;
    }
    else if(nodedTree.depth > sdepth) {
        return null;

    }
    else if(nodedTree.depth < sdepth) {
        var list = new Array()
        if(nodedTree.listOfChildren!=null) {
            for(var i = 0; i < nodedTree.listOfChildren.length; i++) {
                var p = structuredClone(nodedTree.listOfChildren);
                var childC = treePermsAtLevel(nodedTree.listOfChildren[i], sdepth);
                if(childC!=null) {
                    for(j = 0; j < childC.length; j++) {
                        list.push(childC[j]);
                    }
                }
                nodedTree.listOfChildren= p;
            }
        }
        return list;
    }
    else if(nodedTree.depth== sdepth) {
        if(nodedTree.listOfChildren!=null) {
            var placeholder = structuredClone(nodedTree);
            nodedTree.listOfChildren=null;
            nodedTree.isPlaceholder= true;
            var c = structuredClone(returnRootNode(nodedTree));
            nodedTree.listOfChildren= placeholder.listOfChildren;
            nodedTree.isPlaceholder= false;
            return new Array(c);

        }
        return null;
    }
        
}
function getAllLevelPerms(nodedTree) {
    var listOfPerms = [];
    for(var j = Math.ceil(nodedTree.height /2); j >0; j--) {
     var permLevel = treePermsAtLevel(nodedTree, j);
     listOfPerms =listOfPerms.concat(permLevel)
    }
    return listOfPerms;
}

//Given any node, navigates to and returns the root of the tree
function returnRootNode(nodedTreeChild) {
    var c = nodedTreeChild;
    while(c.parent!=null){
        c=c.parent;
    }
    return c;
}

//Transforms array input of [Parent, Child1,Child2, Child3....] to Node object below
function turnArrayToTree(tree) {
        if(!Array.isArray(tree)) {
            var leafNode = new Node(tree, null, false);
            leafNode.setDown(0);
        return leafNode;
    }
    else {
        var listOfKids = []; 
        for(var i = 1; i < tree.length; i++) {
            var tNode = turnArrayToTree(tree[i]);
             listOfKids.push(tNode);
        }
       /* if(listOfKids.length < tree.length -1) {
            var tNode = turnArrayToTree(tree[tree.length-1]);
             listOfKids.push(tNode);
        } */
        var c = new Node(tree[0], listOfKids, false);
        c.setDown(0);
        return c;
            }
}
//Convert output into form that can be output as JS by the interpreter
function turnTreeToArray(nodedTree) {
    if(nodedTree.listOfChildren==null) {
        return nodedTree.data;
    }
    else {
        //big enough to hold the object itself and all its children
        var tempArr = new Array(1+ nodedTree.listOfChildren.length);
        tempArr[0] = nodedTree.data;
        for(var i = 0; i < nodedTree.listOfChildren.length; i++) {
            tempArr[i+1] = turnTreeToArray(nodedTree.listOfChildren[i]);
        }
        return tempArr;
    }
}
//Preorder printout of a nodedTree
function preOrder(nodedTree) {
    if(nodedTree==null) {
    }
    else if(nodedTree.listOfChildren!=null) {
        console.log(nodedTree.data + " " + nodedTree.isPlaceholder)
        console.group()
    for(var i = 0; i < nodedTree.listOfChildren.length; i++) {
        preOrder(nodedTree.listOfChildren[i]);
    }
    console.groupEnd()
    }
    else {
        console.log(nodedTree.data + " " + nodedTree.isPlaceholder)
    }
    
}
//Returns an array of integers that correspond to the path of children to follow the placeholder node(Root node's 0th child's 1st child, then that node's 0th, 2nd, etc)
function findPlaceholderLocation(nodedTree) {
    if(nodedTree==null) {
        return null;
    }
    else if(nodedTree.isPlaceholder) {
        return -1;
    }
    else if(nodedTree.listOfChildren==null || nodedTree.data==null) {
        return null;
    }
    for(var i = 0; i < nodedTree.listOfChildren.length; i++) {
        var c = findPlaceholderLocation(nodedTree.listOfChildren[i]);
        if(c==null) {
            //do nothing
        }
        else if (c==-1) {
            //was a placeholder!

            return [i];
        }
        else {
            return [i].concat(c);
        }
    }
}
//Tests if two nodes are equivalent i.e have the same data
function areNodesEqual(node1, node2) {
    if(node1==null && node2==null) {
        return true;
    }
    else if(node1==null || node2==null) {
        return false;
    }
    else if(node1.data=== node2.data) {
        return true;
    }
    return false;
}

class Node {
     data;
     listOfChildren = null;
     isPlaceholder=false;
     parent = null;
     depth = 0;
     height = -1;
    constructor(data,listOfChildren, isPlaceholder) {
        this.data= data;
        this.listOfChildren=listOfChildren;
        this.isPlaceholder =isPlaceholder;
    }
    isLeaf() {
        if(this.listOfChildren==null || this.listOfChildren==[]) {
            return true;
        }
        return false;
    }
    setDown(d){
        this.depth = d;
        if(this!=null && this.listOfChildren!=null) {
        for(var i = 0; i < this.listOfChildren.length; i++) {
            this.listOfChildren[i].parent= this;
            this.listOfChildren[i].setDown(d+1);
        }
    }
        else {
            this.height = 0;
            if(this.parent!=null) {
            this.parent.setUp(d);
            }
        }

    }
    setUp(h) {
        var c= (this.depth - h) * -1
        if(c>this.height) {
            this.height=c;
        }
        if(this.parent!=null) {
        this.parent.setUp(h);
        }
    }
    
    get listOfChildren() {
        return this.listOfChildren;
    }
    get data() {
        return this.data;
    }
    get isPlaceholder() {
        return this.isPlaceholder;
    }
}
function replaceGivenIndex(array, index, value) {
  returnArray = [];
  for(var i = 0; i < array.length; i++) {
 		if(i==index) {
    returnArray[i]=value;
    }
    else {
    returnArray[i]= array[i];
    }
  }
  if(returnArray.length==0) {
         }
  return returnArray;

}




  module.exports = {
	treeDupes: treeDupes
}

