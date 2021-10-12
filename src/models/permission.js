export default (sequelize, DataTypes) => {
  const Permission = sequelize.define("permission", {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    desc: {
      type: DataTypes.STRING,
      allowNull: true
    }
    //createAt, updateAt 기본으로 생성
  });
  Permission.associate = function (models) {
    models.Permission.belongsTo(models.User, {
      foreignKey: 'userIdKey'
    });
  }
  return Permission;
};