var relations = require('./relations');


class SquareName {
    /*
    Human readable chess board square name.
    Create param:
      - name [string] (include two characters - symbol and number, for example 'a1').
      _ _ _ _ _ _ _ _
    8|_|_|_|_|_|_|_|_|
    7|_|_|_|_|_|_|_|_|
    6|_|_|_|_|_|_|_|_|
    5|_|_|_|_|_|_|_|_|
    4|_|_|_|_|_|_|_|_|
    3|_|_|_|_|_|_|_|_|
    2|_|_|_|_|_|_|_|_|
    1|_|_|_|_|_|_|_|_|
      a b c d e f g h
    */

    static symbols = ["a", "b", "c", "d", "e", "f", "g", "h"];
    static numbers = ["1", "2", "3", "4", "5", "6", "7", "8"];

    constructor(name) {
        let symbol = name[0];
        let number = name[1];
        if (!SquareName.symbols.includes(symbol)) {
            throw Error(`Wrong symbol (${symbol}) passed`);
        }
        if (!SquareName.numbers.includes(number)) {
            throw Error(`Wrong number (${number}) passed`);
        }
        this._symbol = symbol;
        this._number = number;
        this._value = `${symbol}${number}`;
    }

    get symbol() {
        return this._symbol;
    }

    get number() {
        return this._number;
    }

    get value() {
        return this._value;
    }
}


class SquareCoordinates {
    /*
    Chess board square coordinates.
    Create param:
      - coordinates [Array] (include two numbers - square coordinates from 0 to 7, for example [0, 0]).
      _ _ _ _ _ _ _ _
    7|_|_|_|_|_|_|_|_|
    6|_|_|_|_|_|_|_|_|
    5|_|_|_|_|_|_|_|_|
    4|_|_|_|_|_|_|_|_|
    3|_|_|_|_|_|_|_|_|
    2|_|_|_|_|_|_|_|_|
    1|_|_|_|_|_|_|_|_|
    0|_|_|_|_|_|_|_|_|
      0 1 2 3 4 5 6 7
    */

    static numbers = [0, 1, 2, 3, 4, 5, 6, 7];

    static correctCoordinate(coordinate) {
        return SquareCoordinates.numbers.includes(coordinate);
    }

    static correctCoordinates(x, y) {
        return SquareCoordinates.correctCoordinate(x) && SquareCoordinates.correctCoordinate(y);
    }

    constructor(coordinates) {
        let x = coordinates[0];
        let y = coordinates[1];
        if (!SquareCoordinates.correctCoordinate(x)) {
            throw Error(`Wrong x value (${x}) passed`);
        }
        if (!SquareCoordinates.correctCoordinate(y)) {
            throw Error(`Wrong y value (${y}) passed`);
        }
        this._x = x;
        this._y = y;
        this._value = [x, y];
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get value() {
        return this._value;
    }
}


class SquareOnEdge {
    /*
    Chess board square location on edge.
    Create param:
      - coordinates [SquareCoordinates].
    */

    constructor(coordinates) {
        this._up = false;
        this._right = false;
        this._down = false;
        this._left = false;
        if (coordinates.y == 7) {
            this._up = true;
        } else if (coordinates.y == 0) {
            this._down = true;
        }
        if (coordinates.x == 7) {
            this._right = true;
        } else if (coordinates.x == 0) {
            this._left = true;
        }
    }

    get up() {
        return this._up;
    }

    get right() {
        return this._right;
    }

    get down() {
        return this._down;
    }

    get left() {
        return this._left;
    }
}


class SquaresLine {
    /*
    Line between two chess board squares.
    Create param:
      - startSquare [Square];
      - endSquare [Square].
    */

    constructor(startSquare, endSquare) {
        this._startSquare = startSquare;
        this._endSquare = endSquare;
        this._dx = Math.abs(startSquare.coordinates.x - endSquare.coordinates.x);
        this._dy = Math.abs(startSquare.coordinates.y - endSquare.coordinates.y);
        this._direction = {x: 0, y: 0};
        this._betweenSquaresNames = [];
        this._betweenSquaresCount = 0;
        this._getBetweenSquaresData();
    }

    _checkOnTheSameLine() {
        // throw error if squares aren't located on the same line
        if (this._dx != this._dy && this._dx != 0 && this._dy != 0) {
            throw Error(`
                Squares ${this._startSquare.name.value} and ${this._endSquare.name.value}
                aren't located on the same line (horizontal, vertical, diagonal).
            `);
        }
    }

    _getDirection() {
        // get direction of distance between start square and end square
        this._checkOnTheSameLine();
        for (let i of ['x', 'y']) {
            if (this._startSquare.coordinates[i] > this._endSquare.coordinates[i]) {
                this._direction[i] = -1;
            }
            else if (this._startSquare.coordinates[i] < this._endSquare.coordinates[i]) {
                this._direction[i] = 1;
            }
        }
    }

    _getBetweenSquaresData() {
        // get data of squares between start square and end square
        this._getDirection();
        let distance = Math.max(this._dx, this._dy);
        for (let i = 1; i <= distance - 1; i++) {
            let coordinates = [];
            for (let j of ['x', 'y']) {
                coordinates.push(this._startSquare.coordinates[j] + i * this._direction[j]);
            }
            this._betweenSquaresNames.push(Square.coordinatesToName(...coordinates));
        }
        this._betweenSquaresCount = this._betweenSquaresNames.length;
    }

    betweenSquaresNames(includeEnd=false) {
        if (includeEnd) {
            return this._betweenSquaresNames.concat([this._endSquare.name.value]);
        }
        return this._betweenSquaresNames;
    }

    betweenSquaresCount(includeEnd=false) {
        return this._betweenSquaresCount + (includeEnd ? 1 : 0);
    }
}


class Square {
    /*
    Chess board square.
    There are create params:
      - name [string] (SquareName class create param);
      - coordinates [Array] (SquareCoordinates class create param).
    To create instance you need to pass one of this params.
    */

    static symbolToNumber = {"a": 0, "b": 1, "c": 2, "d": 3, "e": 4, "f": 5, "g": 6, "h": 7};
    static numberToSymbol = {0: "a", 1: "b", 2: "c", 3: "d", 4: "e", 5: "f", 6: "g", 7: "h"};

    static coordinatesToName(x, y) {
        return Square.numberToSymbol[x] + (y + 1);
    }

    constructor(name=null, coordinates=null) {
        if (name) {
            this._name = new SquareName(name);
            this._coordinates = new SquareCoordinates([Square.symbolToNumber[this._name.symbol], +(this._name.number - 1)]);
        }
        else if (coordinates) {
            this._coordinates = new SquareCoordinates(coordinates);
            this._name = new SquareName(Square.numberToSymbol[this._coordinates.x] + (this._coordinates.y + 1));
        }
        else {
            throw Error("To create Square instance you need to pass either name or coordinates param");
        }
        this._piece = null;
        this.pieces = new relations.ActionsRelation(this, 'squares');
        this.onEdge = new SquareOnEdge(this.coordinates);
    }

    get name() {
        return this._name;
    }

    get coordinates() {
        return this._coordinates;
    }

    get piece() {
        return this._piece;
    }

    placePiece(piece) {
        this._piece = piece;
    }

    removePiece() {
        this._piece = null;
    }

    theSame(otherSquare) {
        return this.name.value === otherSquare.name.value;
    }

    onVertical(vertical) {
        return this.name.symbol === vertical;
    }

    onHorizontal(horizontal) {
        return this.name.number == horizontal;
    }

    getBetweenSquaresNames(otherSquare, includeOtherSquare=false) {
        return new SquaresLine(this, otherSquare).betweenSquaresNames(includeOtherSquare);
    }

    getBetweenSquaresCount(otherSquare, includeOtherSquare=false) {
        return new SquaresLine(this, otherSquare).betweenSquaresCount(includeOtherSquare);
    }
}


module.exports = {
    Square: Square,
    SquareCoordinates: SquareCoordinates,
    SquareName: SquareName,
    SquareOnEdge: SquareOnEdge,
    SquaresLine: SquaresLine
};