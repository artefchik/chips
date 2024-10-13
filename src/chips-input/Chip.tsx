import {ChangeEvent} from "react";
import {classNames} from "~/shared/helpers/classNames";
import {DeleteIcon} from "~/shared/assets/icons/DeleteIcon";

interface Props {
    className?: string;
    chip?: string;
    onDeleteChip: () => void;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    onMouseOver: () => void;
    isSelected?: boolean
}

export const Chip = (props: Props) => {
    const {
        className,
        chip,
        onChange,
        onBlur,
        onDeleteChip,
        onMouseOver,
        isSelected
    } = props;

    return (
        <li
            className={classNames('chips-tag',
                {'chips-tag-selected': isSelected},
                [className]
            )}
            onMouseOver={onMouseOver}
        >
            <input
                value={chip}
                onChange={onChange}
                onBlur={onBlur}
                style={{
                    width: chip.length + 1 + 'ch',
                }}
                className='chips-tag-input'
                disabled={isSelected}
            />
            <button className='chips-delete-button' onClick={onDeleteChip}>
                <DeleteIcon/>
            </button>
        </li>
    );
};
