import { useState, useEffect, useRef } from 'react';
import { allTypes, typeChart } from '../data/typeData';
import { shuffleArray, normalizeInput } from '../utils/helpers';
import { getResultColor, getResultTextColor, getResultOutline } from '../utils/effectivenessUtils';
import { COLORS } from '../utils/colors';
import DualTypeChart from './dualTypeChart';
import { TYPE_SYMBOL_LETTERS } from '../utils/typeSymbols'; 


function TypeChartFill() {
    const [inputs, setInputs] = useState({});
    const [submitted, setSubmitted] = useState({});
    const [justCorrect, setJustCorrect] = useState({});

    const [shuffle, setShuffle] = useState(false);
    const [shuffledTypes, setShuffledTypes] = useState(allTypes);
    const activeTypes = shuffle ? shuffledTypes : allTypes;

    const [selectedRow, setSelectedRow] = useState(null); 
    const [selectedCol, setSelectedCol] = useState(null);

    const timeoutRefs = useRef({});
    const inputRefs = useRef({});

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
    const handleResize = () => {
        setIsMobile(window.innerWidth < 1000); // might need adjustment
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    }, []);

    function toggleShuffle() {
        if (shuffle) {
            setShuffledTypes(allTypes);
            setShuffle(false);
        } else {
            setShuffledTypes(shuffleArray(allTypes));
            setShuffle(true);
        }
    }

    function handleReset() {
        // If a row/column is selected, reset all inputs in the row/column
        if (selectedRow !== null || selectedCol !== null) {
            const newInputs = { ...inputs };
            const newSubmitted = { ...submitted };
            const newJustCorrect = { ...justCorrect };

            // Reset row inputs
            if (selectedRow !== null) { 
                for (let defender of activeTypes) {
                    const key = `${selectedRow}-${defender}`;
                    delete newInputs[key];
                    delete newSubmitted[key];
                    delete newJustCorrect[key];
                    if (timeoutRefs.current[key]) clearTimeout(timeoutRefs.current[key]);
                }
            }
            // Reset column inputs
            if (selectedCol !== null) { 
                for (let attacker of activeTypes) {
                    const key = `${attacker}-${selectedCol}`;
                    delete newInputs[key];
                    delete newSubmitted[key];
                    delete newJustCorrect[key];
                    if (timeoutRefs.current[key]) clearTimeout(timeoutRefs.current[key]);
                }
            }

            setInputs(newInputs);
            setSubmitted(newSubmitted);
            setJustCorrect(newJustCorrect);
        } 

        // Reset all inputs
        else { 
            setInputs({});
            setSubmitted({});
            setJustCorrect({});
            Object.values(timeoutRefs.current).forEach(clearTimeout);
            timeoutRefs.current = {};
        }
    }

    function getExpected(attacker, defender) {
        return typeChart[attacker]?.[defender] ?? 1;
    }

    // Could be used to check if all inputs are correct
    function checkIfCompleted() {
        for (let attacker of activeTypes) {
            for (let defender of activeTypes) {
                const key = `${attacker}-${defender}`;
                const expected = String(getExpected(attacker, defender));
                const submittedVal = normalizeInput(submitted[key]);
                if (submittedVal !== expected) return false;
            }
        }
        return true;
    }

    function handleSolve() {
        // If a row/column is selected, solve all inputs in the row/column
        const newInputs = { ...inputs };
        const newSubmitted = { ...submitted };
        const newJustCorrect = { ...justCorrect };
        if (selectedRow !== null || selectedCol !== null) {
            // Solve row inputs
            if (selectedRow !== null) {
                for (let defender of activeTypes) {
                    const key = `${selectedRow}-${defender}`;
                    const expected = String(getExpected(selectedRow, defender));
                    newInputs[key] = expected;
                    newSubmitted[key] = expected;
                    newJustCorrect[key] = true;
                    if (timeoutRefs.current[key]) clearTimeout(timeoutRefs.current[key]);
                    timeoutRefs.current[key] = setTimeout(() => {
                        setJustCorrect(prev => {
                            const updated = { ...prev };
                            delete updated[key];
                            return updated;
                        });
                    }, 1200);
                }
            }
            // Solve column inputs
            if (selectedCol !== null) {
                for (let attacker of activeTypes) {
                    const key = `${attacker}-${selectedCol}`;
                    const expected = String(getExpected(attacker, selectedCol));
                    newInputs[key] = expected;
                    newSubmitted[key] = expected;
                    newJustCorrect[key] = true;
                    if (timeoutRefs.current[key]) clearTimeout(timeoutRefs.current[key]);
                    timeoutRefs.current[key] = setTimeout(() => {
                        setJustCorrect(prev => {
                            const updated = { ...prev };
                            delete updated[key];
                            return updated;
                        });
                    }, 1200);
                }
            }
        } 

        // Solve all inputs
        else {
            for (let attacker of activeTypes) {
                for (let defender of activeTypes) {
                    const key = `${attacker}-${defender}`;
                    const expected = String(getExpected(attacker, defender));
                    newInputs[key] = expected;
                    newSubmitted[key] = expected;
                    newJustCorrect[key] = true;
                    if (timeoutRefs.current[key]) clearTimeout(timeoutRefs.current[key]); {
                    timeoutRefs.current[key] = setTimeout(() => {
                        setJustCorrect(prev => {
                            const updated = { ...prev };
                            delete updated[key];
                            return updated;
                        }); }, 1200); 
                    }
                }
            }
        }

        setInputs(newInputs);
        setSubmitted(newSubmitted);
        setJustCorrect(newJustCorrect);
    }

    function handleInputChange(attacker, defender, value) {
        const key = `${attacker}-${defender}`;
        setInputs({ ...inputs, [key]: value });
    }

    function handleInputKeyDown(attacker, defender, rowIdx, colIdx, e) {
        // === Enter key ===
        if (e.key === 'Enter') {
            const key = `${attacker}-${defender}`;
            setSubmitted(prev => ({ ...prev, [key]: inputs[key] }));

            // check if the input is correct
            const expected = String(getExpected(attacker, defender));
            const submittedVal = normalizeInput(inputs[key]);
            if (submittedVal === expected) {
                setJustCorrect(prev => ({ ...prev, [key]: true }));
                if (timeoutRefs.current[key]) clearTimeout(timeoutRefs.current[key]);
                timeoutRefs.current[key] = setTimeout(() => {
                    setJustCorrect(prev => {
                        const updated = { ...prev };
                        delete updated[key];
                        return updated;
                    });
                }, 1200);
            }

            // move focus to next cell (left to right, top to bottom)
            const nextCol = colIdx + 1;
            const nextRow = rowIdx + 1;
            let nextKey;
            if (nextCol < activeTypes.length) {
                const nextDefender = activeTypes[nextCol];
                nextKey = `${attacker}-${nextDefender}`;
                if (inputRefs.current[`${rowIdx}-${nextCol}`]) {
                    inputRefs.current[`${rowIdx}-${nextCol}`].focus();
                }
            } else if (nextRow < activeTypes.length) {
                const nextAttacker = activeTypes[nextRow];
                const nextDefender = activeTypes[0];
                nextKey = `${nextAttacker}-${nextDefender}`;
                if (inputRefs.current[`${nextRow}-0`]) {
                    inputRefs.current[`${nextRow}-0`].focus();
                }
            } else {
                if (inputRefs.current[`0-0`]) {
                    inputRefs.current[`0-0`].focus();
                }
            }
        }

        // === Arrow keys ===
        else if (e.key === 'ArrowRight') {
            const nextCol = colIdx + 1;
            if (nextCol < activeTypes.length) {
                inputRefs.current[`${rowIdx}-${nextCol}`]?.focus();
            }
        } else if (e.key === 'ArrowLeft') {
            const prevCol = colIdx - 1;
            if (prevCol >= 0) {
                inputRefs.current[`${rowIdx}-${prevCol}`]?.focus();
            }
        } else if (e.key === 'ArrowDown') {
            const nextRow = rowIdx + 1;
            if (nextRow < activeTypes.length) {
                inputRefs.current[`${nextRow}-${colIdx}`]?.focus();
            }
        } else if (e.key === 'ArrowUp') {
            const prevRow = rowIdx - 1;
            if (prevRow >= 0) {
                inputRefs.current[`${prevRow}-${colIdx}`]?.focus();
            }
        }
    }

    // Row/Column selection handlers
    function handleRowSelect(type) {
        setSelectedRow(prev => (prev === type ? null : type));
        setSelectedCol(null);
    }
    function handleColSelect(type) {
        setSelectedCol(prev => (prev === type ? null : type));
        setSelectedRow(null);
    }

    function getTypeStyle(type) {return{
        backgroundColor: COLORS.type[type] || '#888',
        color: 'white',
        padding: 0,
        border: '1px solid gray',
        textAlign: 'center',
        minWidth: '48px',
        maxWidth: '48px',
        height: '48px',
        lineHeight: '48px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        fontSize: '0.95em',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        verticalAlign: 'middle',
    };}

        return (
        <div style={{ width: '100%'}}>
            <p style={{
                maxWidth: '800px',
                margin: '0 auto 1em auto',
                fontSize: '0.95em',
                lineHeight: '1.5',
                textAlign: 'center',
            }}>
            Think you know your type matchups? 
            Fill in how effective (2x, 1x, 0.5x) each attacking type is against each defender. 
            You can click on a specific row/column to highlight it and solve or reset just that section. 
            Shuffle the order for a twist, or auto-solve to learn. Scroll down to try dual-type matchups too!
            </p>
            {/* Shuffle button */}

            <label className="switch">
                <input type="checkbox" checked={shuffle} onChange={toggleShuffle} />
                <span className="slider"></span>
                <span style={{ marginLeft: '8px', userSelect: 'none'}}>Shuffle Type Order</span>
            </label>


            <h2>Single-Type Effectiveness Chart</h2>

            {/* Reset button to clear inputs */}
            <button
                onClick={handleReset}
                style={{
                    marginLeft: '1em',
                    padding: '4px 12px',
                    border: '1px solid #888',
                    background: '#eee',
                    cursor: 'pointer',
                    color: 'black',
                }}
            >
                Reset
            </button>

            {/* Solve button to auto-fill answers */}
            <button
                onClick={handleSolve}
                style={{
                    marginLeft: '1em',
                    padding: '4px 12px',
                    border: '1px solid #888',
                    background: '#eee',
                    cursor: 'pointer',
                    color: 'black',
                }}
            >
                Solve
            </button>

            {/* main table */}
            <table
                style={{
                    borderCollapse: 'collapse',
                    marginTop: '1em',
                    width: '100%',
                    tableLayout: 'fixed',
                }}
            >
                <thead>
                    <tr>
                        {/* attack/defense label cell (top-left) */}
                        <th
                            style={{
                                backgroundColor: '#888',
                                color: 'white',
                                fontSize: '0.7em',
                                fontWeight: 'normal',
                                letterSpacing: 'normal',
                                lineHeight: '1.1',
                                textAlign: 'center',
                                verticalAlign: 'middle',
                                minWidth: '48px',
                                maxWidth: '48px',
                                height: '48px',
                                border: '1px solid gray',
                                fontFamily: 'Arial Narrow, Arial, sans-serif',
                            }}
                        >
                            DEF →<br />ATK ↓
                        </th>

                        {/* Row of buttons for each defending type */}
                        {activeTypes.map(type => (
                            <th
                                key={type}
                                style={{
                                    ...getTypeStyle(type),
                                    fontSize: '0.7em',
                                    fontFamily: 'Arial Narrow, Arial, sans-serif',
                                    letterSpacing: 'normal',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    padding: 0,
                                    border: selectedCol === type ? `3px solid ${COLORS.type[type]}` : undefined,
                                    boxShadow: selectedCol === type ? `0 0 0 2px ${COLORS.type[type]} inset` : undefined,
                                }}
                                title={type}
                            >
                                {/* button to select a defending type (selects a column) */}
                                <button
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        background: 'none',
                                        border: 'none',
                                        color: 'inherit',
                                        font: 'inherit',
                                        cursor: 'pointer',
                                        padding: 0,
                                        margin: 0,
                                        outline: selectedCol === type ? `2px solid ${COLORS.type[type]}` : 'none',
                                        fontWeight: 'bold',
                                    }}
                                    onClick={() => handleColSelect(type)}
                                    tabIndex={0}
                                >
                                    {/* {type.toUpperCase()} */}
                                    {isMobile ? 
                                        (<span style={
                                            {fontFamily: 'type-font', fontSize: '1.75em', }
                                            }>{TYPE_SYMBOL_LETTERS[type]}</span>
                                        ) 
                                        :
                                        (<span>{type.toUpperCase()}</span>
                                        )
                                    }
                                </button>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {activeTypes.map((attacker, rowIdx) => (
                        <tr key={attacker}>
                            {/* Column of button for each attacking type */}
                            <td
                                style={{
                                    ...getTypeStyle(attacker),
                                    fontSize: '0.7em',
                                    fontFamily: 'Arial Narrow, Arial, sans-serif',
                                    letterSpacing: 'normal',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    border: selectedRow === attacker ? `3px solid ${COLORS.type[attacker]}` : undefined,
                                    boxShadow: selectedRow === attacker ? `0 0 0 2px ${COLORS.type[attacker]} inset` : undefined,
                                    padding: 0,
                                }}
                                title={attacker}
                            >
                                {/* button to select an attacking type (selects a row) */}
                                <button
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        background: 'none',
                                        border: 'none',
                                        color: 'inherit',
                                        font: 'inherit',
                                        cursor: 'pointer',
                                        padding: 0,
                                        margin: 0,
                                        outline: selectedRow === attacker ? `2px solid ${COLORS.type[attacker]}` : 'none',
                                        fontWeight: 'bold',
                                    }}
                                    onClick={() => handleRowSelect(attacker)}
                                    tabIndex={0}
                                >
                                    {/* {attacker.toUpperCase()} */}
                                    {isMobile ? 
                                        (<span style={
                                            {fontFamily: 'type-font', fontSize: '1.75em', }
                                            }>{TYPE_SYMBOL_LETTERS[attacker]}</span>
                                        ) 
                                        :
                                        (<span>{attacker.toUpperCase()}</span>
                                        )
                                    }
                                </button>
                            </td>

                            {/* Cell for every attacker–defender matchup */}
                            {activeTypes.map((defender, colIdx) => {
                                const key = `${attacker}-${defender}`;
                                const expected = String(getExpected(attacker, defender));
                                const submittedVal = normalizeInput(submitted[key]);
                                const attempted = submitted[key] !== undefined;
                                const correct = attempted && submittedVal === expected;
                                const justEnteredCorrect = !!justCorrect[key];

                                // cell highlighting logic
                                let highlight = false;
                                let highlightColor = '';
                                if (selectedRow === attacker) {
                                    highlight = true;
                                    highlightColor = COLORS.type[attacker];
                                }
                                if (selectedCol === defender) {
                                    highlight = true;
                                    highlightColor = COLORS.type[defender];
                                }

                                // input cell styling
                                let cellStyle = {
                                    padding: 0,
                                    border: highlight ? `2.5px solid ${highlightColor}`: getResultOutline(expected, correct, attempted, justEnteredCorrect),
                                    textAlign: 'center',
                                    minWidth: '48px',
                                    maxWidth: '48px',
                                    height: '48px',
                                    overflow: 'hidden',
                                    verticalAlign: 'middle',
                                    backgroundColor: attempted && correct ? getResultColor(expected) : 'transparent',
                                    color: attempted && correct ? getResultTextColor(expected) : 'inherit',
                                    fontWeight: attempted && correct ? 'bold' : 'normal',
                                    transition: 'border 0.2s, background 0.2s, color 0.2s',
                                };

                                return (
                                    <td key={key} style={cellStyle}>
                                        {/* input for effectiveness values */}
                                        <input
                                            ref={el => (inputRefs.current[`${rowIdx}-${colIdx}`] = el)}
                                            type="text"
                                            value={inputs[key] || ''}
                                            onChange={e => handleInputChange(attacker, defender, e.target.value)}
                                            onKeyDown={e => handleInputKeyDown(attacker, defender, rowIdx, colIdx, e)}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                textAlign: 'center',
                                                background: 'transparent',
                                                color: attempted && correct ? getResultTextColor(expected) : 'inherit',
                                                fontWeight: attempted && correct ? 'bold' : 'normal',
                                                border: 'none',
                                                outline: 'none',
                                                fontSize: '0.95em',
                                                padding: 0,
                                                margin: 0,
                                                pointerEvents: attempted && correct ? 'none' : 'auto',
                                            }}
                                            autoComplete="off"
                                        />
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            {/** TODO: Move DualTypeChart and 'Shuffle Type Order' checkbox to App.jsx to improve modularity*/}
            <DualTypeChart shuffle={shuffle} activeTypes={activeTypes} />
        </div>
    );
}

export default TypeChartFill;
