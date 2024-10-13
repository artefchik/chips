import {ChipsInput} from "~/chips-input/ChipsInput";
import {useState} from "react";

export const App = () => {
    const [value, setValue] = useState('это первый чипс, это "второй," чипс');

    return (
        <div className='app'>
            <ChipsInput value={value} onChange={setValue}/>
            <div>Строковое представление: {value}</div>
        </div>
    );
};
