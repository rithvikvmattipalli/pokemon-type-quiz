import { useState } from 'react';
import { allTypes, typeChart } from '../data/typeData';
import { normalizeInput } from '../utils/helpers';
import { getResultColor, getResultTextColor, getResultOutline } from '../utils/effectivenessUtils';
import { COLORS } from '../utils/colors';
import { TYPE_SYMBOL_LETTERS } from '../utils/typeSymbols'; 

export default function DualTypeChart({ shuffle, activeTypes }) {
    const [comboType1, setComboType1] = useState(allTypes[0]);
    const [comboType2, setComboType2] = useState(allTypes[1]);

    const [comboInputs, setComboInputs] = useState({});
    const [comboSubmitted, setComboSubmitted] = useState({});
    const [comboJustCorrect, setComboJustCorrect] = useState({});

    // Reset the cells in the dual-type chart
    function handleComboReset() {
        setComboInputs({});
        setComboSubmitted({});
        setComboJustCorrect({});
    }

    // Solve the cells in the dual-type chart
    function handleComboSolve() {
        const newInputs = {};
        const newSubmitted = {};
        const newJustCorrect = {};

        for (let attacker of activeTypes) {
            const key = `${attacker}-${comboType1}-${comboType2}`;
            const val1 = typeChart[attacker]?.[comboType1] ?? 1;
            const val2 = typeChart[attacker]?.[comboType2] ?? 1;
            const expected = String(val1 * val2);

            newInputs[key] = expected;
            newSubmitted[key] = expected;
            newJustCorrect[key] = true;

            setTimeout(() => {
                setComboJustCorrect(prev => {
                    const updated = { ...prev };
                    delete updated[key];
                    return updated;
                });
            }, 1200);
        }

        setComboInputs(newInputs);
        setComboSubmitted(newSubmitted);
        setComboJustCorrect(newJustCorrect);
    }

    function getTypeStyle(type) {
        return {
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
            letterSpacing: '1px',
            fontSize: '0.95em',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            verticalAlign: 'middle',
        };
    }   

    return (
        <div style={{ marginTop: '3em' }}>
            <h2>Dual-Type Effectiveness Table</h2>

            <table
                style={{
                    borderCollapse: 'collapse',
                    width: '100%',
                    tableLayout: 'fixed',
                    marginTop: '1em',
                }}
            >
                <thead>
                    <tr>
                        {/* attack/defense label cell (top-left) */}
                        <th
                            style={{
                                ...getTypeStyle('normal'),
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

                        {/* Type1 & Type2 dropdown buttons, Solve button, Reset button */}
                        <th colSpan={2} style={{ padding: 0, border: 'none' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    height: '48px',
                                    width: '100%',
                                    gap: '0.5em',
                                    textAlign: 'center',
                                    textAlignLast: 'center'
                                }}
                            >

                                {/* Type1 & Type2 dropdown buttons */}
                                <div style={{ display:' flex', width: '100%' }}>
                                    {/* Type1 dropdown */}
                                    <select
                                        value={comboType1}
                                        onChange={e => {
                                            setComboType1(e.target.value);
                                            if (e.target.value === comboType2) {
                                                setComboType2(allTypes.find(t => t !== e.target.value));
                                            }
                                        }}
                                        style={{
                                            backgroundColor: COLORS.type[comboType1],
                                            color: 'white',
                                            fontSize: '0.7em',
                                            fontFamily: 'Arial Narrow, Arial, sans-serif',
                                            width: '100%',
                                            height: '48px',
                                            padding: 0,
                                            fontWeight: 'bold',
                                            border: '1px solid gray',
                                            textAlign: 'center',
                                            textTransform: 'uppercase',
                                            verticalAlign: 'top',
                                            margin: 0,
                                            borderRadius: 0,
                                            appearance: 'none',
                                            MozAppearance: 'none',
                                            WebkitAppearance: 'none',
                                        }}
                                    >
                                        {/* only display options not equal to second type */}
                                        {allTypes.map(
                                            (type) =>
                                                type !== comboType2 && (
                                                    <option
                                                        key={type}
                                                        value={type}
                                                        style={{
                                                            backgroundColor: COLORS.type[type],
                                                            color: 'white',
                                                        }}
                                                    >
                                                        {type}
                                                    </option>
                                                )
                                        )}
                                    </select>

                                    {/* Type2 dropdown */}
                                    <select
                                        value={comboType2}
                                        onChange={e => {
                                            setComboType2(e.target.value);
                                            if (e.target.value === comboType1) {
                                                setComboType1(allTypes.find(t => t !== e.target.value));
                                            }
                                        }}
                                        style={{
                                            backgroundColor: COLORS.type[comboType2],
                                            color: 'white',
                                            fontSize: '0.7em',
                                            fontFamily: 'Arial Narrow, Arial, sans-serif',
                                            width: '100%',
                                            height: '48px',
                                            padding: 0,
                                            fontWeight: 'bold',
                                            border: '1px solid gray',
                                            textAlign: 'center',
                                            textTransform: 'uppercase',
                                            verticalAlign: 'top',
                                            margin: 0,
                                            borderRadius: 0,
                                            appearance: 'none',
                                            MozAppearance: 'none',
                                            WebkitAppearance: 'none',
                                        }}
                                    >
                                        {/* only display options not equal to first type */}
                                        {allTypes.map(
                                            (type) =>
                                                type !== comboType1 && (
                                                    <option
                                                        key={type}
                                                        value={type}
                                                        style={{
                                                            backgroundColor: COLORS.type[type],
                                                            color: 'white',
                                                        }}
                                                    >
                                                        {type}
                                                    </option>
                                                )
                                        )}
                                    </select>
                                </div>

                                {/* Solve and Reset buttons */}
                                <div style={{ display: 'flex', gap: '0.5em' }}>
                                    <button
                                        onClick={handleComboReset}
                                        style={{
                                            padding: '4px 12px',
                                            border: '1px solid #888',
                                            background: '#eee',
                                            cursor: 'pointer',
                                            color: 'black',
                                            fontSize: '0.95em',
                                            height: '32px',
                                        }}
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={handleComboSolve}
                                        style={{
                                            padding: '4px 12px',
                                            border: '1px solid #888',
                                            background: '#eee',
                                            cursor: 'pointer',
                                            color: 'black',
                                            fontSize: '0.95em',
                                            height: '32px',
                                        }}
                                    >
                                        Solve
                                    </button>
                                </div>
                            </div>
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {activeTypes.map((attacker) => {
                        const key = `${attacker}-${comboType1}-${comboType2}`;
                        const val1 = typeChart[attacker]?.[comboType1] ?? 1;
                        const val2 = typeChart[attacker]?.[comboType2] ?? 1;
                        const expected = String(val1 * val2);

                        const attempted = comboSubmitted[key] !== undefined;
                        const correct = attempted && normalizeInput(comboSubmitted[key]) === expected;
                        const justEnteredCorrect = !!comboJustCorrect[key];

                        let cellStyle = {
                            padding: 0,
                            border: getResultOutline(expected, correct, attempted, justEnteredCorrect),
                            textAlign: 'center',
                            overflow: 'hidden',
                            verticalAlign: 'middle',
                            backgroundColor: attempted && correct
                                ? getResultColor(expected)
                                : 'transparent',
                            color: attempted && correct
                                ? getResultTextColor(expected)
                                : 'inherit',
                            fontWeight: attempted && correct ? 'bold' : 'normal',
                            transition: 'border 0.2s, background 0.2s, color 0.2s',
                        };

                        return (
                            <tr key={attacker}>
                                {/* Attacking type name cells */}
                                <td
                                    style={{
                                        ...getTypeStyle(attacker),
                                        fontSize: '0.7em',
                                        fontFamily: 'Arial Narrow, Arial, sans-serif',
                                        letterSpacing: 'normal',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        padding: 0,
                                    }}
                                    title={attacker}
                                >
                                    {(<><span style={
                                            { fontFamily: 'type-font', fontSize: '1.75em', marginRight: '0.1em' }
                                            }>{TYPE_SYMBOL_LETTERS[attacker]}</span><span>{attacker.toUpperCase()}</span></>
                                        )}
                                </td>

                                {/* input for effectiveness values */}
                                <td style={cellStyle} colSpan={2}>
                                    <input
                                        type="text"
                                        value={comboInputs[key] || ''}
                                        onChange={e => setComboInputs({ ...comboInputs, [key]: e.target.value })}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                setComboSubmitted(prev => ({ ...prev, [key]: comboInputs[key] }));
                                                if (normalizeInput(comboInputs[key]) === expected) {
                                                    setComboJustCorrect(prev => ({ ...prev, [key]: true }));
                                                    setTimeout(() => {
                                                        setComboJustCorrect(prev => {
                                                            const updated = { ...prev };
                                                            delete updated[key];
                                                            return updated;
                                                        });
                                                    }, 1200);
                                                }
                                            }
                                        }}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            lineHeight: '48px',
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
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
