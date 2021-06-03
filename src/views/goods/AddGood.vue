<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图 -->
    <el-card>
      <el-alert
        type="info"
        title="添加商品信息"
        show-icon
        center
        :closable="false"
      ></el-alert>
      <!-- 步骤条区域 -->
      <el-steps
        :space="200"
        :active="activeIndex * 1"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- 标签页区域 -->
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTagLeave"
          @tab-click="tagClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTabData"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="item"
                  v-for="(item, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTabData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input
            ></el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce" />
            <!-- 添加按钮 -->
            <el-button type="primary" class="addButton" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 预览图片 -->
    <el-dialog title="预览图片" :visible.sync="previewPicVisible" width="50%">
      <img :src="previewPic" alt="" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data() {
    return {
      activeIndex: '0',
      // 添加商品的表单数据
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属分类
        goods_cat: [],
        // 上传的图片路径数组
        pics: [],
        // 商品介绍
        goods_introduce: '',
        // 商品参数
        attrs: []
      },
      // 表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '商品名称不能为空', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '商品价格不能为空', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '商品重量不能为空', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '商品数量不能为空', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '商品分类不能为空', trigger: 'blur' }
        ]
      },
      // 商品分类列表
      cateList: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 商品参数
      manyTabData: [],
      // 商品属性
      onlyTabData: [],
      // 上传图片的地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 上传图片时的请求头对象
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片的URL
      previewPic: '',
      // 预览图片对会话框
      previewPicVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败！')
      }
      this.cateList = res.data
      // console.log(res.data)
    },
    // 联级选择器选择时触发
    handleChange() {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        return
      }
    },
    // 标签页切换时触发
    beforeTagLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        return false
      }
    },
    // 标签页被选中时触发
    async tagClick() {
      // console.log(this.activeIndex)
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取属性数据失败！')
        }
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTabData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取属性数据失败！')
        }
        this.onlyTabData = res.data
      }
    },
    // 点击已上传文件时调用(预览图片)
    handlePreview(file) {
      console.log(file)
      this.previewPic = file.response.data.url
      this.previewPicVisible = true
    },
    // 删除上传文件时调用
    handleRemove(file) {
      const filePath = file.response.data.tem_path
      const i = this.addForm.pics.findIndex(x => x.pics === filePath)
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm.pics)
    },
    // 图片上传成功后，保存到数据中
    handleSuccess(response) {
      const picPath = response.data.tmp_path
      this.addForm.pics.push(picPath)
    },
    // 添加商品
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        // 直接修改addForm会报错
        // 将addForm进行深拷贝  lodash cloneDeep(Obj)
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理静态参数
        this.manyTabData.forEach(item => {
          const attrInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(attrInfo)
        })
        // 处理静态属性
        this.onlyTabData.forEach(item => {
          const attrInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(attrInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)
        // 发起请求，提交添加商品的数据
        const { data: res } = await this.$http.post('/goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }
        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.addButton {
  margin: 15px 0;
}
</style>
