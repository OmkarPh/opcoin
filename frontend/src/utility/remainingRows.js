import React from 'react';

const fillRemainingRows = (actualLength) => {
    const remainingRows = [];
    if(actualLength < process.env.REACT_APP_ENTRIES_PER_PAGE){
        for(let i=0; i<(process.env.REACT_APP_ENTRIES_PER_PAGE - actualLength); i++){
            remainingRows.push(
                <tr key={i}>
                    <td>{<br/>}</td>
                    <td>{}</td>
                    <td>{} </td>
                    <td className="fa-ellipsis-h">{}</td>
                </tr>
            );
        }
    }
    return remainingRows;
}

export default fillRemainingRows;