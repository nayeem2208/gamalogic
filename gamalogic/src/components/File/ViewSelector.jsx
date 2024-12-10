import React from 'react';
import { FaSquare } from "react-icons/fa";
import { RxDividerVertical } from "react-icons/rx";
import { FaList } from 'react-icons/fa6';

function ViewSelector({ tileView, onViewChange }) {
  return (
    <div className='flex shadow rounded-md  md:mt-0 lg:mr-20 px-5 max-w-32 md:max-w-48 py-2 justify-center items-center'>
      <FaSquare 
        onClick={onViewChange} 
        className={`w-5 h-5 ${tileView ? 'text-red-500' : 'text-bgblue'}`} 
      />
      <RxDividerVertical className='w-5 h-5' />
      <FaList 
        onClick={onViewChange} 
        className={`w-5 h-5 ${!tileView ? 'text-red-500' : 'text-bgblue'}`} 
      />
    </div>
  );
}

export default ViewSelector;
