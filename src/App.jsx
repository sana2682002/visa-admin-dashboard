import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";



import Users from "./pages/UsersAll";
import UserDetails from './pages/UserDetails';


import CountriesAll from "./pages/CountriesAll";
import CountryAdd from "./pages/CountryAdd";
import EditCountry from "./pages/EditCountry";


import VisaTypesAll from "./pages/VisaTypesAll";
import VisaTypeAdd from "./pages/VisaTypeAdd";
import VisaTypeEdit from "./pages/VisaTypeEdit";


import RequirementsAll from "./pages/RequirementsAll";
import RequirementAdd from "./pages/RequirementAdd";
import RequirementEdit from "./pages/RequirementEdit";


import TypeReqsView from "./pages/TypeReqsView";
import TypeReqsUpdate from "./pages/TypeReqsUpdate";


import ApplicationsAll from "./pages/ApplicationsAll";
import ApplicationDetails from "./pages/ApplicationDetails";


import Feedbacks from "./pages/Feedbacks";

function App() {
 
  const isLoggedIn = localStorage.getItem("token");
  


  return (
    <Router>
      <Routes>
        {}
        <Route path="/login" element={<Login />} />

        {}
        <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} />

        {}
        <Route path="/" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />

          {/* Users */}
          <Route path="users/all" element={<Users />} />
          <Route path="/admin/users/:id" element={<UserDetails />} />

          {/* Countries */}
          <Route path="countries/all" element={<CountriesAll />} />
          <Route path="countries/add" element={<CountryAdd />} />
          <Route path="countries/edit/:id" element={<EditCountry />} />

          {/* Visa Types */}
          <Route path="visa-types/all" element={<VisaTypesAll />} />
          <Route path="visa-types/add" element={<VisaTypeAdd />} />
          <Route path="visa-types/edit/:id" element={<VisaTypeEdit />} />

          {/* Requirements */}
          <Route path="requirements/all" element={<RequirementsAll />} />
          <Route path="requirements/add" element={<RequirementAdd />} />
          <Route path="requirements/edit/:id" element={<RequirementEdit />} />

          {/* Type Requirements */}
          <Route path="type-requirements/view" element={<TypeReqsView />} />
          <Route path="type-requirements/update" element={<TypeReqsUpdate />} />

          {/* Applications */}
          <Route path="applications/all" element={<ApplicationsAll />} />
          <Route path="applications/:id" element={<ApplicationDetails />} />

          {/* Feedbacks */}
          <Route path="feedbacks" element={<Feedbacks />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
