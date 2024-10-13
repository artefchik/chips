import {classNames} from "~/shared/helpers/classNames";
import {ChangeEvent, KeyboardEvent, useCallback, useEffect, useState} from "react";
import {createChips, isQuotesClosed} from "~/chips-input/chips.utils";
import {Chip} from "~/chips-input/Chip";
import "./ChipsInput.css"

interface Props {
    className?: string;
    value?: string;
    onChange?: (value: string) => void;
}


const ERROR_TEXT = 'Закройте кавычки с двух сторон'

export const ChipsInput = (props: Props) => {
    const {className, value, onChange} = props;
    const [chips, setChips] = useState(() => createChips(value))

    const [error, setError] = useState<{ text: string, keys: number[] }>({
        text: ERROR_TEXT,
        keys: [],
    })

    const [selection, setSelection] = useState<{
        isStarted: boolean,
        list: number[]
    }>({
        isStarted: false,
        list: [],
    })

    const checkErrors = useCallback(() => {
        const errorList: number[] = []

        chips.forEach((chip, key) => {
            if (!isQuotesClosed(chip)) errorList.push(key)
        })

        setError((prevState) => ({
            text: prevState.text,
            keys: errorList,
        }))
    }, [chips])

    const addToSelection = (key: number) => {
        if (selection.isStarted && !selection.list.includes(key)) {
            setSelection((prevState) => ({
                list: [...prevState.list, key],
                isStarted: prevState.isStarted,
            }))
        }
    }
    const startSelection = useCallback(() => {
        if (!selection.isStarted) {
            setSelection((prevState) => ({
                list: prevState.list,
                isStarted: true,
            }))
        }
    }, [selection.isStarted])

    const endSelection = useCallback(() => {
        if (selection.isStarted) {
            setSelection((prevState) => ({
                list: prevState.list,
                isStarted: false,
            }))
        }
    }, [selection.isStarted])

    const resetSelection = useCallback(() => {
        if (!selection.isStarted) {
            setSelection({...selection, list: []})
        }
    }, [selection])

    const removeChips = useCallback(
        (keyList: number[] = []) => {
            const chipsClone = [...chips]

            keyList
                .slice()
                .forEach((key) => {
                    chipsClone.splice(key, 1)
                })

            setChips(chipsClone)
        },
        [chips]
    )

    const setChipsHelper = ({value, key}: { value: string[], key: number }) => {
        const chipsClone = [...chips]
        chipsClone.splice(key, 1, ...value)
        setChips(chipsClone)
    }

    const onChangeInput = ({event, key}: { event: ChangeEvent<HTMLInputElement>, key: number }) => {
        const chipValue = event.target.value
        const chips = createChips(chipValue)

        const filteredChips = chips.filter(
            (element, i) => element !== '' || i === chips.length - 1
        )

        setChipsHelper({
            value: filteredChips,
            key,
        })
    }

    const onBlurInput = (event: React.FocusEvent<HTMLInputElement, Element>) => {
        const chipValue = event.target.value
        const isInputEmpty = !!event.target.value

        if (isQuotesClosed(chipValue)) {
            if (isInputEmpty) setChips((prevState) => [...prevState, ''])
        }

        checkErrors()
    }

    const onKeyDownInput = ({event, key}: { event: KeyboardEvent<HTMLInputElement>, key: number }) => {
        if (event.key === 'Backspace' &&
            selection.list.length === 0 &&
            event.currentTarget.selectionStart === 0 &&
            event.currentTarget.selectionEnd === 0
        ) {
            removeChips([key - 1])
        }
    }

    const onChangeChip = ({event, key}: { event: ChangeEvent<HTMLInputElement>, key: number }) => {
        const chipValue = event.target.value

        if (chipValue === '') {
            removeChips([key])
        } else {
            setChipsHelper({
                value: [chipValue],
                key,
            })
        }
    }

    const onBlurChips = ({event, key}: { event: React.FocusEvent<HTMLInputElement, Element>, key: number }) => {
        const chipValue = event.target.value

        if (isQuotesClosed(chipValue)) {
            const chips = createChips(chipValue)
            const filteredChips = chips.filter((element) => element !== '')

            setChipsHelper({
                value: filteredChips,
                key,
            })
        }

        resetSelection()
    }

    useEffect(() => {
        if (onChange) {
            onChange(chips.join(', '))
        }

        const deleteSelection = (event: globalThis.KeyboardEvent) => {
            if (event.key === 'Backspace' && selection.list.length) {
                removeChips(selection.list)
            }
            resetSelection()
        }

        const mouseDownSelection = () => {
            resetSelection()
            startSelection()
        }

        document.addEventListener('keyup', deleteSelection)
        document.addEventListener('mousedown', mouseDownSelection)
        document.addEventListener('mouseup', endSelection)

        return () => {
            document.removeEventListener('keyup', deleteSelection)
            document.removeEventListener('mousedown', mouseDownSelection)
            document.removeEventListener('mouseup', endSelection)
        }
    }, [
        chips,
        onChange,
        removeChips,
        resetSelection,
        selection.list,
        startSelection,
        endSelection,
    ])

    return (
        <div className={classNames('chips', {}, [className])}>
            <ul className='chips-body'>
                {
                    chips?.map((chip, index) => (
                        index < chips.length - 1 ?
                            <Chip
                                key={index}
                                chip={chip}
                                isSelected={selection.list.includes(index)}
                                onBlur={event => onBlurChips({event, key: index})}
                                onChange={(event) => onChangeChip({event, key: index})}
                                onDeleteChip={() => removeChips([index])}
                                onMouseOver={() => addToSelection(index)}
                            /> : null
                    ))
                }
                <input
                    type="text"
                    className='chips-input'
                    value={chips[chips.length - 1]}
                    placeholder={!chips.length ? 'Введите ключевые слова' : ''}
                    onChange={event => onChangeInput({event, key: chips.length - 1})}
                    onBlur={onBlurInput}
                    onKeyDown={event => onKeyDownInput({event, key: chips.length - 1})}
                />
            </ul>
            {
                <div
                    className={classNames('chips-error-block', {'chips-error-block-error': Boolean(error.keys.length)})}>
                    {error.text}
                </div>
            }
        </div>
    );
};
