import React from 'react';

const fillRemainingRows = (actualLength, totalColumns=4) => {
    const remainingRows = [];
    const cols = [];

    for(let i=1; i<totalColumns; i++)
        cols.push(<td>{<br/>}</td>)

    if(actualLength < process.env.REACT_APP_ENTRIES_PER_PAGE){
        for(let i=0; i<(process.env.REACT_APP_ENTRIES_PER_PAGE - actualLength); i++){
            remainingRows.push(
                <tr key={i}>
                    {/* <td>{<br/>}</td>
                    <td>{}</td>
                    <td>{} </td> */}
                    {cols}
                    <td className="fa-ellipsis-h">{}</td>
                </tr>
            );
        }
    }
    return remainingRows;
}

export default fillRemainingRows;