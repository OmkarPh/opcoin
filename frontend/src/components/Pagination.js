import React from 'react'
import { Button, Pagination } from 'react-bootstrap';

const paginationItems = (activePage, maxPages, setPage)=>{
    const items = [];
    for(let page=activePage-2; page<=(activePage+4) && page<maxPages; page++){
        if(page > 1)
            items.push(
                <Pagination.Item
                    active={activePage === page}
                    onClick={()=>setPage(page)} 
                    key={page}> 
                    {page}
                </Pagination.Item>
            );
    }
    return items;
}

const customPagination = ({page, setPage, pagination}) => {
    return (
        <Pagination>
            <Pagination.Item onClick={ ()=>setPage(1) } active={ page === 1 }>
                1
            </Pagination.Item>

            { 
                (page-2) > 2 ? 
                    <Pagination.Ellipsis /> 
                    : null 
            }
            
            { paginationItems(page, pagination.maxPages, setPage) }

            { 
                (pagination.maxPages-page > 1 && pagination.maxPages-(page+4) > 1) ? 
                <Pagination.Ellipsis /> 
                : null 
            }

            {
                pagination.maxPages > 1 ?
                    <Pagination.Item  
                        onClick={()=>setPage(pagination.maxPages)} 
                        active={page === pagination.maxPages}>
                        {pagination.maxPages}
                    </Pagination.Item>
                : null
            }
            
        </Pagination>
    )
}

export default customPagination;
