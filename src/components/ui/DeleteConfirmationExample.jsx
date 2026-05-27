import React from 'react';
import { ConfirmModal, useConfirmModal } from './index';

// Ejemplo de cómo usar el ConfirmModal para eliminar usuarios
export const DeleteConfirmationExample = () => {
  const { isOpen, openModal, closeModal } = useConfirmModal();

  const handleDeleteUser = (userId) => {
    // Aquí iría la lógica para eliminar el usuario
    console.log('Eliminando usuario:', userId);
    // Llamar a la API para eliminar
    // fetch(`/api/users/${userId}`, { method: 'DELETE' })
  };

  return (
    <div>
      {/* Botón de eliminar que abre el modal */}
      <button 
        className="btn-delete"
        onClick={() => {
          // Guardar el ID del usuario a eliminar (ejemplo)
          const userIdToDelete = 'user-123';
          openModal();
        }}
        title="Eliminar usuario"
      >
        🗑️ Eliminar
      </button>

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={isOpen}
        onClose={closeModal}
        onConfirm={() => handleDeleteUser('user-123')}
        title="Eliminar Usuario"
        message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer y se eliminarán permanentemente todos los datos asociados."
        confirmText="Eliminar Usuario"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

// Ejemplo de cómo integrar en una tabla de usuarios
export const UserTableWithDeleteConfirmation = ({ users, onDeleteUser }) => {
  const { isOpen, openModal, closeModal } = useConfirmModal();
  const [userToDelete, setUserToDelete] = React.useState(null);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    openModal();
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete._id);
      setUserToDelete(null);
    }
  };

  return (
    <div>
      <table className="users-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.status}</td>
              <td>
                <div className="action-buttons">
                  <button 
                    className="btn-action btn-edit"
                    title="Editar usuario"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-action btn-delete"
                    onClick={() => handleDeleteClick(user)}
                    title="Eliminar usuario"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmModal
        isOpen={isOpen}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
        title="Eliminar Usuario"
        message={
          userToDelete 
            ? `¿Estás seguro de que deseas eliminar a ${userToDelete.name}? Esta acción no se puede deshacer.`
            : '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.'
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

// Ejemplo de cómo usar el hook useConfirmation
export const AdvancedDeleteExample = () => {
  const { isOpen, config, confirm, closeModal } = useConfirmation();

  const handleDelete = async (userId) => {
    const confirmed = await confirm({
      title: 'Eliminar Usuario',
      message: '¿Estás seguro de que deseas eliminar este usuario?',
      confirmText: 'Sí, eliminar',
      cancelText: 'No, cancelar',
      type: 'danger'
    });

    if (confirmed) {
      console.log('Usuario eliminado:', userId);
      // Aquí iría la lógica de eliminación
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          console.log('Usuario eliminado exitosamente');
          // Actualizar la lista de usuarios
        } else {
          console.error('Error al eliminar usuario');
        }
      } catch (error) {
        console.error('Error de conexión:', error);
      }
    }
  };

  return (
    <div>
      <button onClick={() => handleDelete('user-123')}>
        Eliminar con Confirmación Avanzada
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={closeModal}
        onConfirm={config.onConfirm}
        title={config.title}
        message={config.message}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        type={config.type}
      />
    </div>
  );
};

export default {
  DeleteConfirmationExample,
  UserTableWithDeleteConfirmation,
  AdvancedDeleteExample
};
