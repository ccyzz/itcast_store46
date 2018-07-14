<template>
  <el-card class="box-card">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索区域 -->
    <el-row class="searchArea">
      <el-col :span="24">
        <!-- 搜索功能
          1，绑定搜索文本框
          2，给搜索按钮绑定事件
        -->
        <el-input placeholder="请输入内容" v-model="searchValue" clearable  class="searchInput">
            <el-button slot="append" @click="handleSearch" icon="el-icon-search"></el-button>
        </el-input>
        <el-button type="success" plain  @click="addUserdialogVisible = true">添加用户</el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      stripe
      border
      :data="list"
      style="width: 100%">
      <el-table-column
        type="index"
        width="50">
      </el-table-column>
      <el-table-column
        prop="username"
        label="姓名"
        width="100">
      </el-table-column>
      <el-table-column
        prop="email"
        label="邮箱"
        width="180">
      </el-table-column>
      <el-table-column
        prop="mobile"
        label="电话">
      </el-table-column>
      <el-table-column
       label="创建日期">
        <template slot-scope="scope">
          {{ scope.row.create_time | fmtDate('YYYY-MM-DD') }}
        </template>
      </el-table-column>
      <el-table-column
        label="用户状态" width="100">
      <template slot-scope="scope">
         <!-- scope.row 就是当前行绑定的数据对象 -->
          <el-switch
            @change="handleSwitch(scope.row)"
            v-model="scope.row.mg_state"
            active-color="#13ce66"
            inactive-color="#ff4949">
         </el-switch>
      </template>
      </el-table-column>
      <el-table-column
       label="操作">
        <template slot-scope="scope">
          <el-button @click="handleShowEditDialog(scope.row)" plain size="mini" type="primary" icon="el-icon-edit" ></el-button>
          <el-button @click="handleDel(scope.row.id)" plain size="mini" type="danger" icon="el-icon-delete" ></el-button>
          <el-button @click="handleShowSetRoleDialog(scope.row)" plain size="mini" type="success" icon="el-icon-check" ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagenum"
      :page-sizes="[2, 4, 6, 8]"
      :page-size="pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

    <!-- 添加用户的弹出框 -->
    <el-dialog @closed="handleClosed" title="添加用户" :visible.sync="addUserdialogVisible">
      <el-form
        ref= "myform"
        :rules= "myRules"
        label-width="100px"
        :model="formData">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="formData.password" type="password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="formData.mobile" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addUserdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAdd">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑用户的弹出框 -->
    <el-dialog @closed="handleClosed" title="编辑用户" :visible.sync="editUserdialogVisible">
      <el-form
        ref= "myform"
        :rules= "myRules"
        label-width="100px"
        :model="formData">
        <el-form-item label="用户名" prop="username">
          <el-input disable v-model="formData.username" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="formData.mobile" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editUserdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleEdit">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 分配用户角色的弹出框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible">
      <el-form
        label-width="100px">
        <el-form-item label="用户名" prop="username">
          {{currentUserName}}
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="currentRoleId">
            <el-option label="请选择" disabled value="-1">
            </el-option>
            <el-option
              v-for="item in roles"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSetRole">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>
<script>
export default {
  data() {
    return {
      // 用户列表
      list: [],
      // true显示正在加载，false的时候不显示
      loading: true,
      pagenum: 1,
      pagesize: 5,
      total: 0,
      searchValue: '',
      // 控制添加用户的对话框显示或隐藏
      addUserdialogVisible: false,
      // 绑定表单数据
      formData: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 表单验证规则
      myRules: {
        username: [
          { required: true, message: '请输用户名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
        ]
      },
      // 控制编辑用户的对话框显示或隐藏
      editUserdialogVisible: false,
      // 控制分配角色的对话框显示或隐藏
      setRoleDialogVisible: false,
      // 分配角色需要的数据
      currentUserName: '',
      currentUserId: -1,
      currentRoleId: -1,
      roles: []
    };
  },
  created() {
    // 发送请求，获取数据
    this.loadData();
  },
  methods: {
    // 分页
    handleSizeChange(val) {
      // 每页数据改变的时候
      this.pagesize = val;
      this.loadData();
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      // 页码改变的时候
      this.pagenum = val;
      this.loadData();
      console.log(`当前页: ${val}`);
    },
    // 发送异步请求，获取数据
    async loadData() {
      // 发送异步请求之前
      this.loading = true;
      // 发送请求之前获取token
      const token = sessionStorage.getItem('token');
      // 在请求头中设置token
      this.$http.defaults.headers.common['Authorization'] = token;
      const res = await this.$http.get(`users?pagenum=${this.pagenum}&pagesize=${this.pagesize}&query=${this.searchValue}`);
      // 异步请求结束
      this.loading = false;
      const data = res.data;

      const {meta: {msg, status}} = data;
      if (status === 200) {
        const {data: {users, total}} = data;
        // console.log(users);
        this.list = users;
        // 获取总条数
        this.total = total;
      } else {
        this.$message.error(msg);
      }
    },
    // 搜索事件
    handleSearch() {
      this.loadData();
    },
    // 用户状态事件
    // 当开关的状态发生改变时
    async handleSwitch(user) {
      const res = await this.$http.put(`users/${user.id}/state/${user.mg_state}`);
      const data = res.data;
      // console.log(data); {data: {}, meta: {}}
      const {meta: {status, msg}} = data;
      if (status === 200) {
        this.$message.success(msg);
      } else {
        this.$message.error(msg);
      }
    },
    // 删除
    async handleDel(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await this.$http.delete(`users/${id}`);
        const data = res.data;
        const {meta: {status, msg}} = data;
        if (status === 200) {
          // 如果删除成功，重新加载数据
          this.pagenum = 1;
          this.loadData();
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
        } else {
          this.message.error(msg);
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    // 点击添加对话框中的确定按钮时
    async handleAdd() {
      // 表单验证
      this.$refs.myform.validate(async (valid) => {
        if (!valid) {
          return this.message.error('请输入完整内容');
        }
        // 验证成功
        const res = await this.$http.post('users', this.formData);
        const data = res.data;
        const {meta: {status, msg}} = data;
        console.log(data);
        if (status === 201) {
          // 隐藏对话框
          this.addUserdialogVisible = false;
          // 提示成功
          this.$message.success(msg);
          // 重新加载页面
          this.loadData();
          // 清除数据
          // for (let key in this.formData) {
          //   this.formData[key] = '';
          // }
        } else {
          this.$message.error(msg);
        }
      });
    },
    // 点击编辑按钮，弹出对话框
    handleShowEditDialog(user) {
      // 显示对话框
      this.editUserdialogVisible = true;
      // 文本框显示用户信息
      this.formData.username = user.username;
      this.formData.mobile = user.mobile;
      this.formData.email = user.email;
      this.formData.id = user.id;
    },
    // 点击编辑对话框中的确定按钮，实现编辑功能
    async handleEdit() {
      const res = await this.$http.put(`users/${this.formData.id}`, {
        mobile: this.formData.mobile,
        email: this.formData.email
      });
      const data = res.data;
      const {meta: {status, msg}} = data;
      if (status === 200) {
        // 修改成功
        // 提示修改成功
        this.$message.success(msg);
        // 关闭对话框
        this.editUserdialogVisible = false;
        // 重新加载数据
        this.loadData();
        // // 清空文本框
        // for (let key in this.formData) {
        //   this.formData[key] = '';
        // }
      } else {
        // 修改失败
        this.$message.error(msg);
      }
    },
    // 添加和修改的对话框关闭以后执行
    handleClosed() {
      // 清空文本框
      for (let key in this.formData) {
        this.formData[key] = '';
      }
    },
    // 点击分配权限按钮，打开分配权限的对话框
    async handleShowSetRoleDialog(user) {
      // console.log(user);
      // 记录当前用户的Id
      this.currentUserId = user.id;
      this.currentUserName = user.username;
      this.setRoleDialogVisible = true;
      const res = await this.$http.get('roles');
      console.log(res);
      this.roles = res.data.data;
      // console.log(this.roles);

      const res1 = await this.$http.get(`users/${user.id}`);
      // console.log(res1.data);
      this.currentRoleId = res1.data.data.rid;
    },
    // 分配角色
    async handleSetRole() {
      const res = await this.$http.put(`users/${this.currentUserId}/role`, {
        rid: this.currentRoleId
      });
      const data = res.data;
      // console.log(data);
      const {meta: {status, msg}} = data;
      // 设置成功
      if (status === 200) {
        // 关闭对话框
        this.setRoleDialogVisible = false;
        // 提示
        this.$message.success(msg);
        // 重置数据
        this.currentRoleId = -1;
        this.currentUserId = -1;
        this.currentUserName = '';
      } else {
        // 失败提示
        this.$message.error(msg);
      }
    }
  }
};
</script>

<style>
.box-card {
  height: 100%;
}

.searchArea {
  margin-top: 10px;
  margin-bottom: 10px;
}

.searchArea .searchInput {
  width: 350px;
}
</style>
