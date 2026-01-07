import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../Layout/AdminLayout";
import "./AdminClientEnrollments.scss";

const AdminClientEnrollments = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEnrollments = async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/client-enrollment/all`,
      { withCredentials: true }
    );
    setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleAction = async (enrollId, action) => {
    if (!window.confirm(`Are you sure you want to ${action}?`)) return;

    await axios.post(
      `${import.meta.env.VITE_API_URL}/client-enrollment/action`,
      { enrollId, action },
      { withCredentials: true }
    );

    fetchEnrollments();
  };

  if (loading) {
    return (
      <AdminLayout>
        <p>Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-enrollments">
        <h2>Client Enrollment Requests</h2>

        <table>
          <thead>
            <tr>
              <th>Enroll ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr key={item.enrollId}>
                <td>{item.enrollId}</td>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.phone}</td>

                <td>
                  <span className={`status ${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>

                <td>
                  {item.status === "PENDING" ? (
                    <>
                      <button
                        className="approve"
                        onClick={() =>
                          handleAction(item.enrollId, "APPROVE")
                        }
                      >
                        Approve
                      </button>

                      <button
                        className="reject"
                        onClick={() =>
                          handleAction(item.enrollId, "REJECT")
                        }
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminClientEnrollments;
