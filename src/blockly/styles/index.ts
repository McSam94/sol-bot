import Blockly from 'blockly';

Blockly.Css.register(`
.block--error > .blocklyPath {
    stroke: #F71735;
    stroke-width: 5px;
}

.blocklyTreeRow {
    height: 40px;
    display: flex;
    align-items: center;
}

.blocklyToolboxDiv {
    background: #EAEAEA;
    cursor: pointer;
}

.blocklyToolboxDiv:hover > .blocklyTreeRow {
    background: #9999A1;
}

.blocklyDropDownContent {
    overflow: hidden;
}
`);
