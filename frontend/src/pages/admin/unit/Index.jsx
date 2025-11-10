import { UnitColumns } from "../../../columns/Unit";
import Datatable from "../../../components/Datatable";
import { useNavigate } from "react-router-dom";

export default function UnitPage() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate(); // <--- ini penting

  const handleAddClick = () => {
    navigate("/menu/unit/add"); // pake navigate, bukan href
  };

  return (
    <div className="p-6">
      <Datatable
        apiUrl={`${API_URL}/api/units`}
        columns={UnitColumns}
        allowAdd={true}
        onAddClick={handleAddClick}
      />
    </div>
  );
}
