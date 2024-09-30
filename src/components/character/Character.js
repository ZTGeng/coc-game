import { useState, useEffect, useRef, useContext } from "react";
import { LanguageContext } from '../../App';

function Info() {
  return (
    <div className="d-flex flex-column">
      <p>Occupation: Student</p>
      <p>Age: 21</p>
    </div>
  )
}

function Characteristics() {
  return (
    <table className="table table-bordered">
      <tbody>
          <tr>
            <th scope="row">STR</th>
            <td>12</td>
            <td>1D6+3</td>
          </tr>
      </tbody>
    </table>
  )
}

function Attributes() {
  return (
    <table className="table table-bordered">
      <tbody>
          <tr>
            <th scope="row">HP</th>
            <td>12</td>
          </tr>
      </tbody>
    </table>
  )
}

function Skills() {
  return (
    <table className="table table-bordered">
      <tbody>
          <tr>
            <th scope="row">Dodge</th>
            <td>25%</td>
          </tr>
      </tbody>
    </table>
  )
}

export default function Character({  }) {

  const { language } = useContext(LanguageContext);
  return (
    <div className="d-flex flex-column ms-2">
      <div className="d-flex">
        <Info />
        <Characteristics />
      </div>
      <Attributes />
      <Skills />
    </div>
  )
}