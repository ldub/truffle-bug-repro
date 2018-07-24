Array.prototype.zip = function (otherArray) {
    console.log(this);
    return this.map((e,i) => [this[i], i < otherArray.length ? otherArray[i] : null]);
};

Array.prototype.difference = function (otherArray) {
    return this.filter((e, i) => !otherArray.includes(e));
};
